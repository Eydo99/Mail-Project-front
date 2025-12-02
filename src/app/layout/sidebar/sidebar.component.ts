import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    isOpen: boolean = true;

   constructor(private router: Router) {}

   navigate(route: string) {
    this.router.navigate([route]);
  }

 openCompose() {
  
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
