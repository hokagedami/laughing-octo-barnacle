import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from "./components/header/header.component";
import {FooterComponent} from "./components/footer/footer.component";
import {CookieService} from "ngx-cookie-service";
import {NgIf} from "@angular/common";
import {EventService} from "./services/event/event.service";
import {Subscription, fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {Platform} from "@angular/cdk/platform";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'logic-gate';
  isNotSuitableScreen: boolean = false;
  private resizeSubscription!: Subscription;

  constructor(cookieService: CookieService, private eventService: EventService, private platform: Platform) {
    cookieService.deleteAll();
  }
  ngOnInit() {
   this.checkScreenSize();
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => {
        this.eventService.emitResize();
      });

    // Emit initial size
    this.eventService.emitResize(this.isNotSuitableScreen);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    console.log('window.innerWidth', window.innerWidth);
    this.isNotSuitableScreen = window.innerWidth <= 991 || (this.platform.IOS || this.platform.ANDROID);
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

}
