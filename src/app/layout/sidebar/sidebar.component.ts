import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Inbox, Star, Send, FileText, Trash2, Users, Settings, Plus, FolderOpen } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Export icons for template use
  readonly Inbox = Inbox;
  readonly Star = Star;
  readonly Send = Send;
  readonly FileText = FileText;
  readonly Trash2 = Trash2;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly Plus = Plus;
  readonly FolderOpen = FolderOpen;

  isOpen: boolean = true;

  constructor(private router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
  }

  openCompose() {
    // TODO: Open compose modal
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  onMouseEnter() {
    this.isOpen = true;
  }

  onMouseLeave() {
    this.isOpen = false;
  }
}
