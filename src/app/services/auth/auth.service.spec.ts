import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  // log out the user after each test
  afterEach(() => {
    service.logout();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set user as logged in after successful login', () => {
    const username = 'testuser';
    const result = service.login(username);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Account creation and login successful');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUsername()).toBe(username);
  });

  it('should return error for empty username', () => {
    const result = service.login('');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Please enter a username');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should log out the user', () => {
    service.login('testuser');
    expect(service.isLoggedIn()).toBe(true);

    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUsername()).toBe('');
  });

  it('should return correct login status', () => {
    expect(service.isLoggedIn()).toBe(false);
    service.login('testuser');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return the correct username', () => {
    const username = 'testuser';
    service.login(username);
    expect(service.getUsername()).toBe(username);
  });

  it('should handle multiple logins', () => {
    service.login('user1');
    expect(service.getUsername()).toBe('user1');

    service.login('user2');
    expect(service.getUsername()).toBe('user2');
  });
});
