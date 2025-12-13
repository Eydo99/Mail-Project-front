import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ComposeData {
  isReplyMode: boolean;
  isForwardMode: boolean;
  replyToEmail: string;
  originalSubject: string;
  originalBody: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComposeService {
  private composeOpenSubject = new BehaviorSubject<boolean>(false);
  composeOpen$ = this.composeOpenSubject.asObservable();

private composeDataSubject = new BehaviorSubject<ComposeData>({
  isReplyMode: false,
  isForwardMode: false,
  replyToEmail: '',
  originalSubject: '',
  originalBody: ''
});
  composeData$ = this.composeDataSubject.asObservable();

  openCompose(): void {
  this.composeDataSubject.next({
    isReplyMode: false,
    isForwardMode: false,
    replyToEmail: '',
    originalSubject: '',
    originalBody: ''
  });
  this.composeOpenSubject.next(true);
}

  openReply(senderEmail: string, subject: string, body: string): void {
    this.composeDataSubject.next({
      isReplyMode: true,
      isForwardMode:false,
      replyToEmail: senderEmail,
      originalSubject: subject,
      originalBody: body
    });
    this.composeOpenSubject.next(true);
  }
  openForward(subject: string, body: string): void {
  this.composeDataSubject.next({
    isReplyMode: false,
    isForwardMode: true,
    replyToEmail: '',
    originalSubject: subject,
    originalBody: body
  });
  this.composeOpenSubject.next(true);
}

  closeCompose(): void {
    this.composeOpenSubject.next(false);
  }
}