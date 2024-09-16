import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when user is logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    expect(guard.canActivate()).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should prevent activation and redirect to login when user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    expect(guard.canActivate()).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
