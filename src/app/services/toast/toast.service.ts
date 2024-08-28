import { Injectable } from '@angular/core';
import {Toast} from "../../models/toast.model";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<Toast>();
  toastState = this.toastSubject.asObservable();

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastSubject.next({ message, type });
  }
}
