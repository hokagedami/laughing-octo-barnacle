import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {UserService} from "../user/user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly cookieName = 'userLoggedIn';

  constructor(private cookieService: CookieService, private userService: UserService, private router: Router) {}

  login(username: string): boolean {
    if (!username || username.trim().length === 0) {
      return false
    }
    // check if user is in the database and add if not
    const user = this.userService.getUserByUsername(username);
    if (user) {
      this.userService.setUser(username);
    }
    this.cookieService.set(this.cookieName, username, 1, '/'); // Expires in 1 day
    return true;
  }

  isLoggedIn(): boolean {
    return this.cookieService.check(this.cookieName);
  }

  getUsername(): string {
    return this.cookieService.get(this.cookieName);
  }

  logout(): void {
    this.cookieService.delete(this.cookieName, '/');
    this.router.navigate(['/']);
  }
}
