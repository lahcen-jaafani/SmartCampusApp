import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatTableModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // KPI Stats
  totalUsers: number = 0;
  totalStudents: number = 0;
  totalProfessors: number = 0;
  totalAdmins: number = 0;
  totalDepartements: number = 0;
  totalMajors: number = 0;
  growthRate: number = 0;
  currentDate: Date = new Date();
  recentActivities: any[] = [];
  topDepartements: any[] = [];

  backendUrl = 'http://localhost:8090';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.http.get(`${this.backendUrl}/api/statistics/users`).subscribe({
      next: (res: any) => {
        this.totalUsers = res.total || 0;
        this.totalStudents = res.students || 0;
        this.totalProfessors = res.professors || 0;
        this.totalAdmins = res.admins || 0;
        this.totalDepartements = res.departements || 0;
        this.totalMajors = res.majors || 0;
        this.growthRate = res.growth || 0;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.totalUsers = 1250;
        this.totalStudents = 950;
        this.totalProfessors = 250;
        this.totalAdmins = 50;
        this.totalDepartements = 12;
        this.totalMajors = 45;
        this.growthRate = 12;
      }
    });
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  getPercentage(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }
}