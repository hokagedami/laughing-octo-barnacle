import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, NavigationEnd, RouterLink, RouterLinkActive} from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from "../../services/auth/auth.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isOnChallengesPage = false;
  routerSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateLoginStatus();
      this.isOnChallengesPage = event.url.includes('/challenges');
    });

    // Initial check
    this.updateLoginStatus();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updateLoginStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
