import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailService } from '../../core/services/mail.service';

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.css'
})
export class ComposeComponent {
  @Output() close = new EventEmitter<void>();

  to: string = '';
  subject: string = '';
  body: string = '';
  priority: string = 'normal';
  attachments: File[] = [];

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private mailService: MailService) {}

  onClose(): void {
    this.close.emit();
  }

  async onSend(): Promise<void> {  // Changed to async
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
      attachements: attachmentDTOs, // Now includes actual attachment data
      piriority: priorityMap[this.priority]
    };

    console.log('Sending mail with attachments:', mailContent); // Debug log

    this.mailService.composeMail(mailContent).subscribe({
      next: (response) => {
        console.log('Email sent successfully:', response);
        this.successMessage = 'Email sent successfully!';
        this.isLoading = false;
        setTimeout(() => this.close.emit(), 1500);
      },
      error: (error) => {
        console.error('Error sending email:', error);
        this.errorMessage = 'Failed to send email. Please try again.';
        this.isLoading = false;
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
