import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ToastService} from "../../services/toast/toast.service";
import {Toast} from "../../models/toast.model";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast | null = null;
  isVisible = true;
  private subscription: Subscription | undefined;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toastState.subscribe(
      toast => {
        this.toast = toast;
        this.isVisible = true;
        console.log('ToastComponent: toast', toast);
        setTimeout(() => {
          this.isVisible = false;
        }, 3000);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
