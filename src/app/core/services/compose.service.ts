import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComposeService {
  private composeOpenSubject = new BehaviorSubject<boolean>(false);
  composeOpen$ = this.composeOpenSubject.asObservable();

  openCompose(): void {
    this.composeOpenSubject.next(true);
  }

  closeCompose(): void {
    this.composeOpenSubject.next(false);
  }
}