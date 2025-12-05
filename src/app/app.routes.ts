import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { InboxListComponent } from './inbox/inbox-list/inbox-list.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { FoldersComponent } from './components/folders/folders.component';
import { FolderViewComponent } from './components/folder-view/folder-view.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'inbox', pathMatch: 'full' },
      { path: 'inbox', component: InboxListComponent },
      { path: 'priority', component: InboxListComponent }, 
      { path: 'sent', component: InboxListComponent },
      { path: 'drafts', component: InboxListComponent },
      { path: 'trash', component: InboxListComponent },
      {path:'contacts',component:ContactsComponent},
      {path: 'folder/:id', component:FolderViewComponent },
      {path:'folders',component:FoldersComponent},
      { path: '**', redirectTo: 'inbox' },
    ]
  }
];
