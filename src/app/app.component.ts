import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// PrimeNG 19 Components
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { OrganizationService, Organization } from './services/organization.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    BadgeModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private orgService = inject(OrganizationService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  title = 'Dev CRM Dashboard';
  backendLoading = false;
  backendConnected: boolean | null = null;
  backendGreeting = '';

  // Organization Data from Quarkus MySQL API
  organizations: Organization[] = [];
  orgLoading = false;

  // Dialog State
  orgDialog = false;
  isEditMode = false;
  currentOrg: Organization = { name: '' };
  savingOrg = false;

  ngOnInit() {
    this.checkBackendConnection();
    this.loadOrganizations();
  }

  checkBackendConnection() {
    this.backendLoading = true;
    this.http.get('http://localhost:8080/hello', { responseType: 'text' }).subscribe({
      next: (res) => {
        this.backendGreeting = res;
        this.backendConnected = true;
        this.backendLoading = false;
      },
      error: () => {
        this.backendConnected = false;
        this.backendGreeting = 'Offline / Unable to reach Quarkus at http://localhost:8080';
        this.backendLoading = false;
      }
    });
  }

  loadOrganizations() {
    this.orgLoading = true;
    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
        this.orgLoading = false;
      },
      error: (err) => {
        this.orgLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch organizations from Quarkus MySQL API'
        });
      }
    });
  }

  openNewOrgDialog() {
    this.currentOrg = { name: '' };
    this.isEditMode = false;
    this.orgDialog = true;
  }

  editOrg(org: Organization) {
    this.currentOrg = { ...org };
    this.isEditMode = true;
    this.orgDialog = true;
  }

  saveOrganization() {
    if (!this.currentOrg.name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Organization name is required'
      });
      return;
    }

    this.savingOrg = true;
    if (this.isEditMode && this.currentOrg.id) {
      this.orgService.updateOrganization(this.currentOrg.id, this.currentOrg).subscribe({
        next: () => {
          this.savingOrg = false;
          this.orgDialog = false;
          this.loadOrganizations();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Organization updated'
          });
        },
        error: () => {
          this.savingOrg = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update organization'
          });
        }
      });
    } else {
      this.orgService.createOrganization({ name: this.currentOrg.name }).subscribe({
        next: () => {
          this.savingOrg = false;
          this.orgDialog = false;
          this.loadOrganizations();
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Organization added successfully'
          });
        },
        error: () => {
          this.savingOrg = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create organization'
          });
        }
      });
    }
  }

  confirmDeleteOrg(org: Organization) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${org.name}" (ID #${org.id})?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (org.id) {
          this.orgService.deleteOrganization(org.id).subscribe({
            next: () => {
              this.loadOrganizations();
              this.messageService.add({
                severity: 'info',
                summary: 'Deleted',
                detail: `Organization #${org.id} removed`
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Could not delete organization'
              });
            }
          });
        }
      }
    });
  }
}
