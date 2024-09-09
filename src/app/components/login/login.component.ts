import {Component, inject} from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from "../../services/auth/auth.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgxToastAlertsService} from "ngx-toast-alerts";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';

  private toast = inject(NgxToastAlertsService);
  loginForm!: FormGroup;


  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required]
    });
  }

  startChallenge() {
    if (this.loginForm.invalid) {
      this.toast.error('Please enter a username');
      return;
    }
    if (this.loginForm.value.username) {
      this.username = this.loginForm.value.username;
      const loginResponse = this.authService.login(this.username);
      if (loginResponse.success) {
        this.toast.success(loginResponse.message!);
        this.router.navigate(['/challenges']);
      } else {
        this.toast.error(loginResponse.error!);
      }
    }
    else {
      this.toast.error('Please enter a username');
      this.username = '';
    }
  }
}
