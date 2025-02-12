import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { EditorDashboardComponentComponent } from './modules/editor-dashboard-component/editor-dashboard-component.component';
import { UnauthorizedComponentComponent } from './modules/unauthorized-component/unauthorized-component.component';
import { JwtModule } from '@auth0/angular-jwt';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { TaskComponent } from './modules/task/task.component';
import { FormsModule } from '@angular/forms';
import { CreatetaskComponent } from './modules/task/createtask/createtask.component';
import { EdittaskComponent } from './modules/task/edittask/edittask.component';
import { ViewtaskComponent } from './modules/task/viewtask/viewtask.component';
import { importProvidersFrom } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ReadonlyComponent } from './modules/task/readonly/readonly.component';
import { ForgotpasswordComponent } from './pages/forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './pages/resetpassword/resetpassword.component';
import { InlineComponent } from './modules/task/inline/inline.component';
export function tokenGetter() {
  return sessionStorage.getItem('access'); // Get token from storage
}


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    EditorDashboardComponentComponent,
    UnauthorizedComponentComponent,
    TaskComponent,
    CreatetaskComponent,
    EdittaskComponent,
    ViewtaskComponent,
    ProfileComponent,
    ChangePasswordComponent,
    ReadonlyComponent,
    ForgotpasswordComponent,
    ResetpasswordComponent,
    InlineComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ToastrModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['127.0.0.1:8000'], // Adjust for your backend
        disallowedRoutes: ['http://127.0.0.1:8000/api/auth/login/']
      }
    }),
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatSelectModule,
    MatPaginator,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
    
  ],
  providers: [
    JwtHelperService,
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    importProvidersFrom(ViewtaskComponent),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // ✅ Set Locale (Optional)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
