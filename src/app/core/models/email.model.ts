export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isStarred: boolean;
  hasAttachment: boolean;
  priority: number;
  folder?: string;
}
