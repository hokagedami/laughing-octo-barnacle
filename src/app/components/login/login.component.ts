import {Component, inject, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../services/auth/auth.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgxToastAlertsService} from "ngx-toast-alerts";
import {NgIf} from "@angular/common";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  username: string = '';
  password: string = '';
  isAdmin: boolean = false;
  currentRoute: string = '';

  private routerSubscription!: Subscription;

  private toast = inject(NgxToastAlertsService);
  loginForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['']
    });
  }

  ngOnInit() {
    this.currentRoute = this.route.snapshot.url.join('/');
    if (this.currentRoute === 'admin-login') {
      this.isAdmin = true;
      // make password required for admin login
      this.loginForm.controls['password'].setValidators(Validators.required);
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
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

  login() {
    switch (this.currentRoute) {
      case 'admin-login':
        if (this.loginForm.invalid) {
          this.toast.error('Please enter a username and password');
          return;
        }
        if (this.loginForm.value.username === 'admin'
          && this.loginForm.value.password === 'admin') {
          this.authService.login('admin');
          this.router.navigate(['/settings']);
        } else {
          this.toast.error('Invalid username or password');
        }
        break;
      default:
        this.startChallenge();
        break;
    }
  }
}
