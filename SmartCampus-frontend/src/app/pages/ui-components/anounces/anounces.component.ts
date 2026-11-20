import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';

import { GenericCrudComponent } from '../generic-crud-component/generic-crud-component.component';
import { AnounceService } from 'src/app/components/services/anounce.service';
import { Anounce } from 'src/app/models/Anounce.model';
import { AuthService } from "../../../components/services/auth.service";

@Component({
  selector: 'app-anounces',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    MatMenuModule,
  ],
  templateUrl: './anounces.component.html',
  styleUrls: ['./anounces.component.scss'],
})
export class AnouncesComponent extends GenericCrudComponent<Anounce> {
  backendUrl = 'http://localhost:8090';

  allItems: Anounce[] = [];
  actualites: Anounce[] = [];
  evenements: Anounce[] = [];
  currentFilter: string = 'all';
  currentPage: number = 0;
  itemsPerPage: number = 3;

  constructor(protected override service: AnounceService, protected authService: AuthService) {
    super(service);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadItems();
  }

  override loadItems(): void {
    this.service.getAll().subscribe(data => {
      this.allItems = data;
      this.actualites = data.filter(item => item.type === 'ACTUALITE').slice(0, 6);
      this.evenements = data.filter(item => item.type === 'EVENEMENT').slice(0, 6);
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 0;
  }

  getFilteredItems(): Anounce[] {
    if (this.currentFilter === 'all') {
      return [...this.actualites, ...this.evenements];
    }
    if (this.currentFilter === 'actualite') {
      return this.actualites;
    }
    if (this.currentFilter === 'evenement') {
      return this.evenements;
    }
    return this.allItems;
  }

  getPaginatedItems(): Anounce[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.getFilteredItems().slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.getFilteredItems().length / this.itemsPerPage);
  }

  hasNextPage(): boolean {
    return (this.currentPage + 1) * this.itemsPerPage < this.getFilteredItems().length;
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage++;
    }
  }

  isFilterActive(filter: string): boolean {
    return this.currentFilter === filter;
  }
}