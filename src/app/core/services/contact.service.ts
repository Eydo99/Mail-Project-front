import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/Contact';
import { Email } from '../models/EmailContacts';
import { Phone } from '../models/phoneContacts';
import { PaginatedContactResponse } from '../models/PaginatedContactResponse';

export interface ContactRequest {
  name: string;
  emails: Email[];
  phones: Phone[];
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/contacts';

  constructor(private http: HttpClient) {}

  getAllContacts(
    page: number = 1,
    size: number = 10,
    search?: string,
    sortBy: string = 'name'
  ): Observable<PaginatedContactResponse> {

    let params = new HttpParams()
      .set('page', (page - 1).toString()) // backend expects 0-based page index
      .set('size', size.toString())
      .set('sortBy', sortBy);

    if (search && search.trim() !== '') {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedContactResponse>(this.apiUrl, { params });
  }

  createContact(request: ContactRequest): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, request);
  }

  updateContact(id: string, request: ContactRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}