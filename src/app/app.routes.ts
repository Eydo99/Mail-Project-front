import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { InboxListComponent } from './inbox/inbox-list/inbox-list.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { LoginComponent } from './loginpage/login/login.component';
import { SignupComponent } from './loginpage/signup/signup.component';
import {TrashListComponent} from "./inbox/trash-list/trash-list.component";
import { FoldersPageComponent } from './components/folders-page/folders-page.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';
import {PriorityInboxComponent} from "./inbox/priority-inbox/priority-inbox.component";
import {SentListComponent} from "./inbox/sent-list/sent-list.component";
import {DraftListComponent} from "./inbox/draft-list/draft-list.component";

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
      { path: 'priority', component: PriorityInboxComponent },
      { path: 'sent', component: SentListComponent },
      { path: 'drafts', component: DraftListComponent },
      { path: 'trash', component: TrashListComponent },
      { path: 'contacts', component: ContactsComponent },
      { path: 'folders', component:FoldersPageComponent },
      { path: 'folder/:id', component: FolderViewComponent },
    ],
  },

  // Unknown routes → Login
  { path: '**', redirectTo: 'login' },
];
