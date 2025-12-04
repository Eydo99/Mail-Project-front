import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/Contact';
import { Email } from '../models/EmailContacts';
import { Phone } from '../models/phoneContacts';

export interface ContactRequest {
  name: string;
  emails: Email[];
  phones: Phone[];
}

export interface PageResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/contacts';

  constructor(private http: HttpClient) {}

  getAllContacts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'name'
  ): Observable<PageResponse<Contact>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<Contact>>(this.apiUrl, { params });
  }

  getContactById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  createContact(request: ContactRequest): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, request);
  }

  updateContact(id: string, request: ContactRequest): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/${id}`, request);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}