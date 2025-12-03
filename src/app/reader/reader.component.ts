import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailStateService } from '../core/services/email-state.service';
import { Email } from '../core/models/email.model';

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reader.component.html',
  styleUrl: './reader.component.css'
})
export class ReaderComponent implements OnInit {
  selectedEmail: Email | null = null;
  isOpen: boolean = false;

  constructor(private emailStateService: EmailStateService) {}

  ngOnInit(): void {
    this.emailStateService.selectedEmail$.subscribe(email => {
      this.selectedEmail = email;
    });

    this.emailStateService.readerOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  closeReader(): void {
    this.emailStateService.closeReader();
  }

  onReply(): void {
    console.log('Reply to:', this.selectedEmail?.sender);
    // TODO: Open compose modal
  }

  onForward(): void {
    console.log('Forward:', this.selectedEmail?.subject);
    // TODO: Open compose modal with forwarded content
  }

  onDelete(): void {
    console.log('Delete:', this.selectedEmail?.id);
    // TODO: Implement delete
    this.closeReader();
  }
}
