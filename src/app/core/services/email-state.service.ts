import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Email } from '../models/email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailStateService {
  private selectedEmailSubject = new BehaviorSubject<Email | null>(null);
  public selectedEmail$: Observable<Email | null> = this.selectedEmailSubject.asObservable();

  private readerOpenSubject = new BehaviorSubject<boolean>(false);
  public readerOpen$: Observable<boolean> = this.readerOpenSubject.asObservable();

  selectEmail(email: Email): void {
    this.selectedEmailSubject.next(email);
    this.readerOpenSubject.next(true);
  }

  closeReader(): void {
    this.readerOpenSubject.next(false);
    // Optional: clear selected email after animation
    setTimeout(() => {
      this.selectedEmailSubject.next(null);
    }, 300);
  }

  getSelectedEmail(): Email | null {
    return this.selectedEmailSubject.value;
  }
}
