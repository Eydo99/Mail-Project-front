import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Phone } from '../../core/models/phoneContacts';
import { Email } from '../../core/models/EmailContacts';
import { Contact } from '../../core/models/Contact';
import { PaginationComponent } from '../pagination/pagination.component';
import { ContactRequest, ContactService } from '../../core/services/contact.service';




@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})

export class ContactsComponent implements OnInit {
  constructor(private contactService: ContactService) {}
  
  contacts: Contact[] = [];
  searchTerm: string = '';
  sortBy: string = 'name';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedContact: Contact | null = null;

  formName: string = '';
  formEmails: Email[] = [];
  formPhones: Phone[] = [];
  
  // Validation errors
  validationErrors: {
    name?: string;
    emails?: { [index: number]: string };
    phones?: { [index: number]: string };
  } = {};


  ngOnInit(): void {
    console.log('Component initialized');
    this.loadContacts();
  }


  loadContacts(): void {
    console.log('Loading contacts...', {
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
      searchTerm: this.searchTerm,
      sortBy: this.sortBy
    });
    
    this.contactService.getAllContacts(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.sortBy
    ).subscribe({
      next: (response) => {
        console.log('Contacts response:', response);
        this.contacts = response.contacts;
        this.totalItems = response.totalItems;
        console.log('Contacts loaded:', this.contacts);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  onSort(): void {
    this.loadContacts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContacts();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.loadContacts();
  }


  openAddModal(): void {
    this.modalMode = 'add';
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(contact: Contact): void {
    this.modalMode = 'edit';
    this.selectedContact = contact;
    this.formName = contact.name;
    this.formEmails = contact.emails && contact.emails.length > 0 
      ? contact.emails.map(e => ({ ...e }))
      : [{ address: '', isPrimary: true }];
    this.formPhones = contact.phones && contact.phones.length > 0
      ? contact.phones.map(p => ({ ...p }))
      : [{ number: '', isPrimary: true }];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formName = '';
    this.formEmails = [{ address: '', isPrimary: true }];
    this.formPhones = [{ number: '', isPrimary: true }];
    this.selectedContact = null;
    this.validationErrors = {};
  }

  addEmailField(): void {
    this.formEmails.push({
      address: '',
      isPrimary: false
    });
  }

  removeEmailField(index: number): void {
    if (this.formEmails.length > 1) {
      this.formEmails.splice(index, 1);
      // Ensure at least one email is primary
      if (!this.formEmails.some(e => e.isPrimary)) {
        this.formEmails[0].isPrimary = true;
      }
    }
  }

  setPrimaryEmail(index: number): void {
    this.formEmails.forEach((email, i) => {
      email.isPrimary = i === index;
    });
  }

  addPhoneField(): void {
    this.formPhones.push({
      number: '',
      isPrimary: false
    });
  }

  removePhoneField(index: number): void {
    if (this.formPhones.length > 1) {
      this.formPhones.splice(index, 1);
      // Ensure at least one phone is primary
      if (!this.formPhones.some(p => p.isPrimary)) {
        this.formPhones[0].isPrimary = true;
      }
    }
  }

  setPrimaryPhone(index: number): void {
    this.formPhones.forEach((phone, i) => {
      phone.isPrimary = i === index;
    });
  }

  saveContact(): void {
    // Clear previous errors
    this.validationErrors = {};
    
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    const payload: ContactRequest = {
      name: this.formName.trim(),
      emails: this.formEmails.filter(e => e.address.trim() !== ''),
      phones: this.formPhones.filter(p => p.number.trim() !== '')
    };

    if (this.modalMode === 'add') {
      this.contactService.createContact(payload).subscribe({
        next: () => {
          this.loadContacts();
          this.closeModal();
        },
        error: (error) => {
          this.handleServerValidationErrors(error);
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedContact) {
      this.contactService.updateContact(this.selectedContact.id!, payload).subscribe({
        next: () => {
          this.loadContacts();
          this.closeModal();
        },
        error: (error) => {
          this.handleServerValidationErrors(error);
        }
      });
    }
  }

  validateForm(): boolean {
    let isValid = true;

    // Validate name
    if (!this.formName || this.formName.trim().length < 2) {
      this.validationErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    } else if (this.formName.trim().length > 100) {
      this.validationErrors.name = 'Name must not exceed 100 characters';
      isValid = false;
    }

    // Validate emails
    this.validationErrors.emails = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasValidEmail = false;

    this.formEmails.forEach((email, index) => {
      if (email.address.trim() === '') {
        this.validationErrors.emails![index] = 'Email address is required';
        isValid = false;
      } else if (!emailRegex.test(email.address)) {
        this.validationErrors.emails![index] = 'Invalid email format';
        isValid = false;
      } else {
        hasValidEmail = true;
      }
    });

    if (!hasValidEmail) {
      this.validationErrors.name = this.validationErrors.name || 'At least one valid email is required';
      isValid = false;
    }

    // Validate phones
    this.validationErrors.phones = {};
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

    this.formPhones.forEach((phone, index) => {
      if (phone.number.trim() !== '' && !phoneRegex.test(phone.number)) {
        this.validationErrors.phones![index] = 'Invalid phone number format';
        isValid = false;
      }
    });

    return isValid;
  }

  handleServerValidationErrors(error: any): void {
    if (error.error && typeof error.error === 'object') {
      // Handle backend validation errors
      Object.keys(error.error).forEach(key => {
        if (key === 'name') {
          this.validationErrors.name = error.error[key];
        } else if (key.startsWith('emails')) {
          const match = key.match(/emails\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            if (!this.validationErrors.emails) {
              this.validationErrors.emails = {};
            }
            this.validationErrors.emails[index] = error.error[key];
          }
        } else if (key.startsWith('phones')) {
          const match = key.match(/phones\[(\d+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            if (!this.validationErrors.phones) {
              this.validationErrors.phones = {};
            }
            this.validationErrors.phones[index] = error.error[key];
          }
        }
      });
    } else {
      alert('An error occurred while saving the contact. Please try again.');
    }
  }

  deleteContact(contact: Contact): void {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contactService.deleteContact(contact.id!).subscribe(() => {
        this.loadContacts();
      });
    }
  }
}