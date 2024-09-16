import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../services/auth/auth.service';
import { NgxToastAlertsService } from 'ngx-toast-alerts';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<NgxToastAlertsService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceSpy = jasmine.createSpyObj('NgxToastAlertsService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NgxToastAlertsService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty username', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
  });

  it('should have the form invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should have the form valid when username is provided', () => {
    component.loginForm.get('username')?.setValue('testuser');
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should disable the submit button when form is invalid', () => {
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeTruthy();
  });

  it('should enable the submit button when form is valid', () => {
    component.loginForm.get('username')?.setValue('testuser');
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeFalsy();
  });

  it('should show error toast when submitting empty form', () => {
    component.startChallenge();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Please enter a username');
  });

  it('should call AuthService.login with username when form is valid', () => {
    const username = 'testuser';
    component.loginForm.get('username')?.setValue(username);
    authServiceSpy.login.and.returnValue({ success: true, message: 'Login successful' });
    component.startChallenge();
    expect(authServiceSpy.login).toHaveBeenCalledWith(username);
  });

  it('should navigate to challenges page on successful login', () => {
    component.loginForm.get('username')?.setValue('testuser');
    authServiceSpy.login.and.returnValue({ success: true, message: 'Login successful' });
    component.startChallenge();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/challenges']);
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Login successful');
  });

  it('should show error toast on login failure', () => {
    component.loginForm.get('username')?.setValue('testuser');
    authServiceSpy.login.and.returnValue({ success: false, error: 'Login failed' });
    component.startChallenge();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Login failed');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should have correct CSS classes for styling', () => {
    const loginContainer = fixture.debugElement.query(By.css('.login-container'));
    const loginForm = fixture.debugElement.query(By.css('.login-form'));
    expect(loginContainer).toBeTruthy();
    expect(loginForm).toBeTruthy();
  });

  it('should display the correct form title', () => {
    const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
    expect(titleElement.textContent).toContain('Login');
  });
});
