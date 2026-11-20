import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuthService } from 'src/app/components/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TablerIconsModule,
  ],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  items = [
    { name: 'Génie Civil' },
    { name: 'Informatique' },
    { name: 'Gestion' },
    { name: 'Médecine' },
  ];

  userFullName: string = '';
  isAuthenticated: boolean = false;
  private userSubscription: Subscription;

  ngOnInit(): void {
    this.userSubscription = this.authService.getCurrentUser$().subscribe(user => {
      if (user && user.firstName && user.lastName) {
        this.userFullName = `${user.firstName} ${user.lastName}`;
        this.isAuthenticated = true;
      } else {
        this.userFullName = '';
        this.isAuthenticated = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.clearUser();
    this.router.navigate(['/ui-components/login']);
  }

  navigateToMajor(item: any): void {
    this.router.navigate(['/ui-components/majors', item.id]);
  }
}
