import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Angular Material modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import Swal from "sweetalert2";
import {MajorService} from "../../../components/services/major.service";

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule
  ],
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.scss']
})
export class AddStudentComponent implements OnInit {
  form!: FormGroup;
  majors: any[] = [];
  years: string[] = [];
  selectedSemester: string = 'Semestre 1';
  niveaux: string[] = ['1ère année', '2ème année', '3ème année'];
  selectedNiveau: string = '';
  selectedMajorId: number | null = null;

  // Excel import
  selectedFile: File | null = null;
  isImporting: boolean = false;
  importProgress: number = 0;
  importTotal: number = 0;
  importProgressInterval: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private majorService:MajorService

  ) {}

  ngOnInit(): void {
    this.loadMajors();
    this.generateAnneesUniversitaires();

    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      cne: ['', Validators.required],
      semester: ['', Validators.required],
      niveauScolaire: ['', Validators.required],
      anneeUniversitaire: ['', Validators.required],
      majorId: [null, Validators.required],
      role: ['STUDENT', Validators.required]

    });
  }
  loadMajors(): void {
    this.majorService.getAll().subscribe(data => this.majors = data);
  }
  submit(): void {
    if (this.form.invalid) return;

    const values = this.form.getRawValue();
    const password = values.lastName.toLowerCase() + '@usms';

    const student = {
      ...values,
      password,
      role: 'STUDENT'
    };

    this.http.post('http://localhost:8090/api/student', student).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Étudiant ajouté avec succès !',
          showConfirmButton: false,
          timer: 2000
        });

        this.router.navigate(['/ui-components/students']);
        this.form.reset();
        this.form.patchValue({ role: 'STUDENT' });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Une erreur s'est produite lors de l'ajout de l'étudiant.",
          footer: err?.error?.message || ''
        });
        console.error('Erreur lors de l’ajout de l’étudiant', err);
      }
    });
  }


  private generateAnneesUniversitaires(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 4; i++) {
      const start = currentYear - i;
      const end = start + 1;
      this.years.push(`${start}-${end}`);
    }
  }

  // Excel Import
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      this.selectedFile = file;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un fichier Excel valide (.xlsx ou .xls)'
      });
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    fileInput.click();
  }

  importStudents(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un fichier Excel'
      });
      return;
    }

    this.isImporting = true;
    this.importProgress = 0;
    this.importTotal = 0;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Start progress polling
    this.importProgressInterval = setInterval(() => {
      this.http.get('http://localhost:8090/api/student/import-progress').subscribe({
        next: (res: any) => {
          this.importProgress = res.progress || 0;
          this.importTotal = res.total || 0;
          if (this.importProgress >= 100) {
            clearInterval(this.importProgressInterval);
          }
        }
      });
    }, 500);

    this.http.post('http://localhost:8090/api/student/import-excel', formData).subscribe({
      next: (res: any) => {
        this.isImporting = false;
        clearInterval(this.importProgressInterval);
        this.importProgress = 100;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Import terminé ! ${res.count} étudiant(s) importé(s).`,
          showConfirmButton: false,
          timer: 3000
        });
        this.selectedFile = null;
        this.router.navigate(['/ui-components/students']);
      },
      error: (err) => {
        this.isImporting = false;
        clearInterval(this.importProgressInterval);
        this.importProgress = 0;
        Swal.fire({
          icon: 'error',
          title: 'Erreur d\'import',
          text: err?.error?.error || 'Une erreur est survenue lors de l\'import'
        });
        console.error('Import error:', err);
      }
    });
  }
}
