package org.sid.school_managementback.serviceImpl;

import org.apache.poi.ss.usermodel.*;
import org.modelmapper.ModelMapper;
import org.sid.school_managementback.DTO.NoteDto;
import org.sid.school_managementback.DTO.StudentDto;
import org.sid.school_managementback.DTO.StudentWithNotesDTO;
import org.sid.school_managementback.Repository.MajorRepository;
import org.sid.school_managementback.Repository.StudentRepository;
import org.sid.school_managementback.entity.Major;
import org.sid.school_managementback.entity.RoleName;
import org.sid.school_managementback.entity.SessionType;
import org.sid.school_managementback.entity.Student;
import org.sid.school_managementback.mapper.StudentMapper;
import org.sid.school_managementback.service.EmailService;
import org.sid.school_managementback.service.NoteService;
import org.sid.school_managementback.service.StudentService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class StudentServiceImpl extends GenericServiceImpl<Student, StudentDto, Long> implements StudentService {
    private final StudentRepository studentRepository;
    private final MajorRepository majorRepository;
    private final StudentMapper studentMapper;
    private final BCryptPasswordEncoder passwordEncoder;
    private final NoteService noteService;
    private final EmailService emailService;
    private final ModelMapper modelMapper;
    private final AtomicInteger importProgress = new AtomicInteger(0);
    private volatile int totalRows = 0;

    public StudentServiceImpl(StudentRepository studentRepository, MajorRepository majorRepository,
                              StudentMapper studentMapper, BCryptPasswordEncoder passwordEncoder,
                              NoteService noteService, EmailService emailService, ModelMapper modelMapper) {
        super(studentRepository, studentMapper);
        this.studentRepository = studentRepository;
        this.majorRepository = majorRepository;
        this.studentMapper = studentMapper;
        this.passwordEncoder = passwordEncoder;
        this.noteService = noteService;
        this.emailService = emailService;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<StudentDto> getStudentsByYearMajorNiveau(String year, Long majorId, String niveau) {
        return studentRepository.findByYearAndMajorAndNiveau(year, majorId, niveau)
                .stream()
                .map(studentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    protected void setEntityId(Student entity, Long aLong) {
    }

    @Override
    public List<StudentWithNotesDTO> getStudentsWithNotesByCriteria(
            Long majorId, String semester, String anneeUniversitaire,
            Long moduleId, SessionType sessionType) {

        List<Student> students = studentRepository.findStudentsWithNotesByCriteria(
                majorId, semester, anneeUniversitaire, moduleId, sessionType);

        return students.stream()
                .map(student -> {
                    StudentWithNotesDTO dto = modelMapper.map(student, StudentWithNotesDTO.class);
                    dto.setMajorId(student.getMajor().getId());
                    dto.setMajorName(student.getMajor().getNAME());

                    List<NoteDto> filteredNotes = student.getNotes().stream()
                            .filter(note -> moduleId == null || note.getModule().getId().equals(moduleId))
                            .filter(note -> sessionType == null || note.getSessionType().equals(sessionType))
                            .map(note -> modelMapper.map(note, NoteDto.class))
                            .collect(Collectors.toList());

                    dto.setNotes(filteredNotes);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentWithNotesDTO> getStudentsWithNotesByCriteria2(
            Long majorId, String semester, String anneeUniversitaire,
            Long moduleId, SessionType sessionType, Long etudiantId) {

        List<Student> students = studentRepository.findStudentsWithNotesByCriteria2(
                majorId, semester, anneeUniversitaire, moduleId, sessionType, etudiantId);

        return students.stream()
                .map(student -> {
                    StudentWithNotesDTO dto = modelMapper.map(student, StudentWithNotesDTO.class);
                    if (student.getMajor() != null) {
                        dto.setMajorId(student.getMajor().getId());
                        dto.setMajorName(student.getMajor().getNAME());
                    }

                    List<NoteDto> filteredNotes = student.getNotes().stream()
                            .filter(note -> {
                                boolean matchesModule = moduleId == null ||
                                        (note.getModule() != null && note.getModule().getId().equals(moduleId));
                                boolean matchesSession = sessionType == null ||
                                        note.getSessionType() == sessionType;
                                return matchesModule && matchesSession;
                            })
                            .map(note -> modelMapper.map(note, NoteDto.class))
                            .collect(Collectors.toList());

                    dto.setNotes(filteredNotes);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public StudentDto save(StudentDto dto) {
        if (dto.getPassword() != null) {
            dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return super.save(dto);
    }

    @Override
    public StudentDto update(Long id, StudentDto dto) {
        if (dto.getPassword() != null) {
            dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return super.update(id, dto);
    }

    @Override
    public List<Student> getStudentsByModule(Long moduleId) {
        return studentRepository.findByModuleId(moduleId);
    }

    @Override
    public List<StudentDto> getStudentsByMajorAndSemester(Long majorId, String semester) {
        List<Student> students = studentRepository.findByMajorAndModuleSemester(majorId, semester);
        return students.stream()
                .map(studentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<StudentDto> importStudentsFromExcel(MultipartFile file) throws Exception {
        List<StudentDto> importedStudents = new java.util.ArrayList<>();
        resetProgress();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();
            this.totalRows = totalRows;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell firstNameCell = row.getCell(0);
                Cell lastNameCell = row.getCell(1);
                Cell emailCell = row.getCell(2);
                Cell phoneCell = row.getCell(3);
                Cell cneCell = row.getCell(4);
                Cell niveauCell = row.getCell(5);
                Cell anneeCell = row.getCell(6);
                Cell semesterCell = row.getCell(7);
                Cell roleCell = row.getCell(8);
                Cell majorNameCell = row.getCell(9);
                Cell photoCell = row.getCell(10);

                if (firstNameCell == null || lastNameCell == null || emailCell == null) continue;

                String firstName = firstNameCell.getStringCellValue().trim();
                String lastName = lastNameCell.getStringCellValue().trim();
                String email = emailCell.getStringCellValue().trim();
                String phone = phoneCell != null ? phoneCell.getStringCellValue().trim() : "";
                String cne = cneCell != null ? cneCell.getStringCellValue().trim() : "";
                String niveau = niveauCell != null ? niveauCell.getStringCellValue().trim() : "1ère année";
                String annee = anneeCell != null ? anneeCell.getStringCellValue().trim() : "";
                String semester = semesterCell != null ? semesterCell.getStringCellValue().trim() : "Semestre 1";
                String majorName = majorNameCell != null ? majorNameCell.getStringCellValue().trim() : "";
                String roleStr = roleCell != null ? roleCell.getStringCellValue().trim() : "STUDENT";
                String photoUrl = photoCell != null ? photoCell.getStringCellValue().trim() : "";

                String randomPassword = "Pass" + (int)(Math.random() * 9000 + 1000) + "2025";

                if (email.isEmpty() || studentRepository.existsByEmail(email)) continue;

                try {
                    Student student = new Student();
                    student.setFirstName(firstName);
                    student.setLastName(lastName);
                    student.setEmail(email);
                    student.setPhoneNumber(phone);
                    student.setCne(cne);
                    student.setNiveauScolaire(niveau);
                    student.setAnneeUniversitaire(annee);
                    student.setSemester(semester);
                    student.setPassword(passwordEncoder.encode(randomPassword));

                    RoleName role = roleStr.equalsIgnoreCase("ADMINISTRATOR") ? RoleName.ADMINISTRATOR : RoleName.STUDENT;
                    student.setRole(role);

                    if (photoUrl != null && !photoUrl.isEmpty()) {
                        student.setPhotoUrl(photoUrl);
                    }

                    if (majorName != null && !majorName.isEmpty()) {
                        org.sid.school_managementback.entity.Major major = majorRepository.findByName(majorName);
                        if (major != null) {
                            student.setMajor(major);
                        }
                    }

                    Student saved = studentRepository.save(student);
                    importedStudents.add(studentMapper.toDto(saved));

                    try {
                        emailService.sendEmail(email, "Votre compte SmartCampus",
                            "Bonjour " + firstName + " " + lastName + ",\n\nVotre compte a été créé avec succès.\n\nIdentifiant (email) : " + email + "\nMot de passe : " + randomPassword + "\n\nConnectez-vous sur : http://localhost:4200/login");
                    } catch (Exception e) {
                        System.err.println("Failed to send email to " + email + ": " + e.getMessage());
                    }

                    // Update progress
                    int progress = (int) (((double) i / sheet.getLastRowNum()) * 100);
                    importProgress.set(progress);

                } catch (Exception e) {
                    System.err.println("Failed to import row " + i + ": " + e.getMessage());
                }
            }
        }

        return importedStudents;
    }

    public int getImportProgress() {
        return importProgress.get();
    }

    public void resetProgress() {
        importProgress.set(0);
        totalRows = 0;
    }

    public int getTotalRows() {
        return totalRows;
    }
}