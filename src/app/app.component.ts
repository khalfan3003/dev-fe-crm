import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';

interface CustomerLead {
  id: number;
  name: string;
  company: string;
  email: string;
  dealValue: string;
  status: 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    BadgeModule,
    InputTextModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private http = inject(HttpClient);

  title = 'Dev CRM Dashboard';
  quarkusMessage = 'Not tested yet';
  backendLoading = false;
  backendConnected: boolean | null = null;

  leads: CustomerLead[] = [
    { id: 101, name: 'Naeem P.M.', company: 'Eszes Tech', email: 'naeem@eszes.com', dealValue: '$24,500', status: 'Won' },
    { id: 102, name: 'Khalfan Ali', company: 'Global CRM Solutions', email: 'khalfan@globalcrm.com', dealValue: '$48,000', status: 'Proposal' },
    { id: 103, name: 'Sarah Jenkins', company: 'Apex Dynamics', email: 's.jenkins@apexdyn.io', dealValue: '$18,200', status: 'Negotiation' },
    { id: 104, name: 'Omar Al-Fassi', company: 'Emirates Cloud', email: 'omar@emcloud.ae', dealValue: '$65,000', status: 'Qualified' }
  ];

  checkBackendConnection() {
    this.backendLoading = true;
    this.quarkusMessage = 'Connecting to Quarkus backend (http://localhost:8080/hello)...';

    this.http.get('http://localhost:8080/hello', { responseType: 'text' }).subscribe({
      next: (response) => {
        this.quarkusMessage = response;
        this.backendConnected = true;
        this.backendLoading = false;
      },
      error: (err) => {
        this.quarkusMessage = 'Cannot connect to Quarkus backend (make sure `mvnw quarkus:dev` is running on port 8080)';
        this.backendConnected = false;
        this.backendLoading = false;
      }
    });
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Won':
        return 'success';
      case 'Negotiation':
        return 'warn';
      case 'Proposal':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
