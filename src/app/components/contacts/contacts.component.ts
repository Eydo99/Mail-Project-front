import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Phone } from '../../core/models/phoneContacts';
import { Email } from '../../core/models/EmailContacts';
import { Contact } from '../../core/models/Contact';
import { PaginationComponent } from '../pagination/pagination.component';




@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  paginatedContacts: Contact[] = [];
  searchTerm: string = '';
  sortBy: string = 'name';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Modal state
  showModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedContact: Contact | null = null;
  
  // Form fields
  formName: string = '';
  formEmails: Email[] = [{ id: this.generateId(), address: '', isPrimary: true }];
  formPhones: Phone[] = [{ id: this.generateId(), number: '', isPrimary: true }];

  ngOnInit(): void {
    this.loadMockData();
    this.filteredContacts = [...this.contacts];
    this.totalItems = this.filteredContacts.length;
    this.updatePaginatedContacts();
  }

  loadMockData(): void {
    this.contacts = [
      {
        id: '1',
        name: 'Sarah Johnson',
        emails: [
          { id: '1a', address: 'sarah.johnson@company.com', isPrimary: true },
          { id: '1b', address: 'sjohnson@personal.com', isPrimary: false }
        ],
        phones: [
          { id: '1p', number: '+1 (555) 123-4567', isPrimary: true }
        ],
        initials: 'SJ',
        avatarColor: '#3b82f6'
      },
      {
        id: '2',
        name: 'Team Notifications',
        emails: [
          { id: '2a', address: 'team@company.com', isPrimary: true }
        ],
        phones: [
          { id: '2p', number: '+1 (555) 234-5678', isPrimary: true }
        ],
        initials: 'TN',
        avatarColor: '#8b5cf6'
      },
      {
        id: '3',
        name: 'Client Business',
        emails: [
          { id: '3a', address: 'client@business.com', isPrimary: true }
        ],
        phones: [
          { id: '3p', number: '+1 (555) 345-6789', isPrimary: true }
        ],
        initials: 'CB',
        avatarColor: '#ec4899'
      },
      {
        id: '4',
        name: 'HR Department',
        emails: [
          { id: '4a', address: 'hr@company.com', isPrimary: true }
        ],
        phones: [
          { id: '4p', number: '+1 (555) 456-7890', isPrimary: true }
        ],
        initials: 'HD',
        avatarColor: '#10b981'
      }
    ];
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(term) ||
        contact.emails.some(email => email.address.toLowerCase().includes(term)) ||
        contact.phones.some(phone => phone.number.toLowerCase().includes(term))
      );
    }
    this.applySorting();
    this.totalItems = this.filteredContacts.length;
    this.currentPage = 1; // Reset to first page on search
    this.updatePaginatedContacts();
  }

  onSort(): void {
    this.applySorting();
    this.updatePaginatedContacts();
  }

  applySorting(): void {
    this.filteredContacts.sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (this.sortBy === 'email') {
        const emailA = a.emails[0]?.address || '';
        const emailB = b.emails[0]?.address || '';
        return emailA.localeCompare(emailB);
      }
      return 0;
    });
  }

  updatePaginatedContacts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedContacts = this.filteredContacts.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedContacts();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.updatePaginatedContacts();
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
    this.formEmails = [{ id: this.generateId(), address: '', isPrimary: true }];
    this.formPhones = [{ id: this.generateId(), number: '', isPrimary: true }];
    this.selectedContact = null;
  }

  addEmailField(): void {
    this.formEmails.push({
      id: this.generateId(),
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
      id: this.generateId(),
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

    const validEmails = this.formEmails.filter(e => e.address.trim());
    const validPhones = this.formPhones.filter(p => p.number.trim());
    
    if (this.modalMode === 'add') {
      const newContact: Contact = {
        id: this.generateId(),
        name: this.formName.trim(),
        emails: validEmails,
        phones: validPhones,
        initials: this.generateInitials(this.formName),
        avatarColor: this.generateRandomColor()
      };
      this.contacts.push(newContact);
    } else if (this.modalMode === 'edit' && this.selectedContact) {
      const index = this.contacts.findIndex(c => c.id === this.selectedContact!.id);
      if (index !== -1) {
        this.contacts[index] = {
          ...this.contacts[index],
          name: this.formName.trim(),
          emails: validEmails,
          phones: validPhones,
          initials: this.generateInitials(this.formName)
        };
      }
    }

    this.onSearch();
    this.closeModal();
  }

  deleteContact(contact: Contact): void {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contacts = this.contacts.filter(c => c.id !== contact.id);
      this.onSearch();
    }
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  generateInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  generateRandomColor(): string {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}