import {Component, inject} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../services/auth/auth.service";
import {FormsModule} from "@angular/forms";
import {ToastService} from "../../services/toast/toast.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ToastComponent} from "../toast/toast.component";
import {NgxToastAlertsService} from "ngx-toast-alerts";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ToastComponent
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';

  private toast = inject(NgxToastAlertsService);


  constructor(private authService: AuthService, private router: Router) {}

  startChallenge() {
    if (this.username) {
      const loginSuccessful = this.authService.login(this.username);
      if (loginSuccessful) {
        this.toast.success('Login successful');
        this.router.navigate(['/challenges']);
      } else {
        this.toast.error('Login failed');
      }
    }
    else {
      this.toast.error('Please enter a username');
      this.username = '';
    }
  }
}
