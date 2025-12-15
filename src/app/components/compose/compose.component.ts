import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailService } from '../../core/services/mail.service';
import { ComposeService } from '../../core/services/compose.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.css'
})
export class ComposeComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  isReplyMode: boolean = false;
  isForwardMode: boolean = false;
  private composeDataSubscription?: Subscription;

  to: string = '';
  subject: string = '';
  body: string = '';
  priority: string = 'normal';
  attachments: File[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private mailService: MailService,
    private composeService: ComposeService

  ) { }

  ngOnInit(): void {
  this.composeDataSubscription = this.composeService.composeData$.subscribe(data => {
    this.isReplyMode = data.isReplyMode;
    this.isForwardMode = data.isForwardMode;
    
    if (data.isReplyMode) {
      this.to = data.replyToEmail;
      this.subject = data.originalSubject.startsWith('Re:') 
        ? data.originalSubject 
        : `Re: ${data.originalSubject}`;
      this.body = `\n\n--- Original Message ---\n${data.originalBody}`;
    } else if (data.isForwardMode) {
      this.to = '';
      this.subject = data.originalSubject.startsWith('Fwd:') 
        ? data.originalSubject 
        : `Fwd: ${data.originalSubject}`;
      this.body = `\n\n--- Forwarded Message ---\n${data.originalBody}`;
    } else {
      this.to = '';
      this.subject = '';
      this.body = '';
      this.attachments = [];
      this.priority = 'normal';
    }
  });
}

  onClose(): void {
    this.close.emit();
  }
  ngOnDestroy(): void {
    if (this.composeDataSubscription) {
      this.composeDataSubscription.unsubscribe();
    }
  }

  async onSend(): Promise<void> {
  if (!this.validateForm()) {
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Convert priority string to number matching your DTO
  const priorityMap: { [key: string]: number } = {
    'low': 4,
    'normal': 3,
    'high': 2,
    'urgent': 1
  };

  // Split recipients by comma and trim whitespace
  const recipients = this.to.split(',').map(email => email.trim()).filter(email => email);

  // Convert attachments to DTO format
  const attachmentDTOs = await this.convertAttachments();

  // Match your mailContentDTO structure
  const mailContent = {
    body: this.body,
    subject: this.subject,
    recipients: recipients,
    attachements: attachmentDTOs,
    piriority: priorityMap[this.priority]
  };

  console.log('Sending mail with attachments:', mailContent);

  this.mailService.composeMail(mailContent).subscribe({
    next: (response: any) => {
      console.log('Email response:', response);
      this.isLoading = false;

      if (response.status === 'success') {
        // All emails sent successfully
        this.successMessage = `✅ Email sent successfully to all ${response.totalSent} recipient(s)!`;
        setTimeout(() => this.close.emit(), 2000);
      } else if (response.status === 'partial') {
        // Some succeeded, some failed
        const successList = response.successful.join(', ');
        const failedList = response.failed.join(', ');
        
        this.successMessage = `✅ Email sent successfully to: ${successList}`;
        this.errorMessage = `❌ Failed to send to: ${failedList} (not registered in the system)`;
        
        // Don't auto-close on partial success so user can see both messages
      } else if (response.status === 'failed') {
        // All failed
        const failedList = response.failed.join(', ');
        this.errorMessage = `❌ Failed to send email to: ${failedList}. These email addresses are not registered in our system.`;
      }
    },
    error: (error) => {
      console.error('Error sending email:', error);
      this.isLoading = false;
      
      // Handle error response
      if (error.error && error.error.message) {
        this.errorMessage = `❌ ${error.error.message}`;
      } else {
        this.errorMessage = '❌ Failed to send email. Please try again.';
      }
    }
  });
}

  async onSaveDraft(): Promise<void> {  // Changed to async
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Convert priority string to number matching your DTO
    const priorityMap: { [key: string]: number } = {
      'low': 4,
      'normal': 3,
      'high': 2,
      'urgent': 1
    };

    // Split recipients by comma and trim whitespace
    const recipients = this.to.split(',').map(email => email.trim()).filter(email => email);

    // Convert attachments to DTO format
    const attachmentDTOs = await this.convertAttachments();

    // Match your mailContentDTO structure
    const mailContent = {
      body: this.body,
      subject: this.subject,
      recipients: recipients,
      attachements: attachmentDTOs, // Now includes actual attachment data
      piriority: priorityMap[this.priority]
    };

    this.mailService.saveDraft(mailContent).subscribe({
      next: (response) => {
        console.log('Draft saved successfully:', response);
        this.successMessage = 'Draft saved successfully!';
        this.isLoading = false;
        setTimeout(() => this.close.emit(), 1500);
      },
      error: (error) => {
        console.error('Error saving draft:', error);
        this.errorMessage = 'Failed to save draft. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.attachments.push(...newFiles);
      console.log('Files selected:', this.attachments); // Debug log
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove data:type;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Convert attachments to DTO format matching your Java DTO
   */
  private async convertAttachments(): Promise<any[]> {
    const attachmentDTOs = [];

    for (const file of this.attachments) {
      try {
        const base64Content = await this.fileToBase64(file);
        const attachmentDTO = {
          filename: file.name,
          filePath: base64Content, // Base64 encoded file content
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size
        };
        attachmentDTOs.push(attachmentDTO);
        console.log('Converted attachment:', attachmentDTO.filename); // Debug log
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }

    return attachmentDTOs;
  }

  validateForm(): boolean {
    if (!this.to.trim()) {
      this.errorMessage = 'Please enter recipient email address.';
      return false;
    }

    if (!this.subject.trim()) {
      this.errorMessage = 'Please enter email subject.';
      return false;
    }

    if (!this.body.trim()) {
      this.errorMessage = 'Please enter email message.';
      return false;
    }

    // Validate all email addresses (handle comma-separated emails)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = this.to.split(',').map(email => email.trim()).filter(email => email);

    for (const email of emails) {
      if (!emailPattern.test(email)) {
        this.errorMessage = `Invalid email address: ${email}`;
        return false;
      }
    }

    return true;
  }
}
