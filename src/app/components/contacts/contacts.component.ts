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
[x: string]: any;
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


  ngOnInit(): void {
    this.loadContacts();
  }


  loadContacts(): void {
    this.contactService.getAllContacts(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.sortBy
    ).subscribe((response) => {
      this.contacts = response.contacts;
      this.totalItems = response.totalItems;
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
    this.formEmails = contact.emails.map(e => ({ ...e }));
    this.formPhones = contact.phones.map(p => ({ ...p }));
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
    if (!this.formName.trim() || !this.formEmails.some(e => e.address.trim())) {
      alert('Please provide a name and at least one email address.');
      return;
    }

    const payload: ContactRequest = {
      name: this.formName.trim(),
      emails: this.formEmails,
      phones: this.formPhones
    };

    if (this.modalMode === 'add') {
      this.contactService.createContact(payload).subscribe(() => {
        this.loadContacts();
        this.closeModal();
      });
    } else if (this.modalMode === 'edit' && this.selectedContact) {
      this.contactService.updateContact(this.selectedContact.id!, payload).subscribe(() => {
        this.loadContacts();
        this.closeModal();
      });
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