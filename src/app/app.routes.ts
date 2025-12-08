import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { InboxListComponent } from './inbox/inbox-list/inbox-list.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { TrashListComponent } from "./inbox/trash-list/trash-list.component";
import { FoldersComponent } from './components/folders/folders.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import { LoginComponent } from './loginpage/login/login.component';
import { SignupComponent } from './loginpage/signup/signup.component';

export const routes: Routes = [
  // Default route goes to login page
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Protected Shell section
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'inbox', component: InboxListComponent },
      { path: 'priority', component: InboxListComponent },
      { path: 'sent', component: InboxListComponent },
      { path: 'drafts', component: InboxListComponent },
      { path: 'trash', component: TrashListComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'folders', component: FoldersComponent },
      { path: 'folder/:id', component: FolderViewComponent },
    ],
  },

  // Unknown routes → Login
  { path: '**', redirectTo: 'login' },
];
