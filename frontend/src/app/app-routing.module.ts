import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RoleGuard } from './guards/role.guard';
import { CreatetaskComponent } from './modules/task/createtask/createtask.component';
import { EdittaskComponent } from './modules/task/edittask/edittask.component';
import { TaskComponent } from './modules/task/task.component';
import { ViewtaskComponent } from './modules/task/viewtask/viewtask.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ReadonlyComponent } from './modules/task/readonly/readonly.component';

const routes: Routes = [
  {
    path:'', redirectTo:'login', pathMatch:"full",
  },
  {
    path:'login', component:LoginComponent,
  },
  {
    path:'home', component:HomeComponent,
  },
  { 
    path: 'task', 
    component: TaskComponent, 
    canActivate: [RoleGuard],
    children: [
      { path: 'create-task', component: CreatetaskComponent },
      { path: 'edit-task/:id', component: EdittaskComponent },
      { path: 'tasks/:id', component: ViewtaskComponent }
    ]
  },
  { path: 'tasks', component: TaskComponent },
  { path: 'realony', component: ReadonlyComponent },
  { path: 'profile', component: ProfileComponent },  
  { path: 'change-password', component: ChangePasswordComponent }, 
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
