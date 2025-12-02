import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ReaderComponent } from '../../reader/reader.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-shell',
  standalone: true,
 imports: [
    RouterOutlet,
    SidebarComponent,
    ReaderComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {

}
