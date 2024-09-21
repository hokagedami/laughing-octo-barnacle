import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private resizeSubject = new Subject<{ width: number; height: number }>();

  resizeObservable$: Observable<{ width: number; height: number }> = this.resizeSubject.asObservable().pipe(
    debounceTime(200) // Debounce to avoid excessive emissions
  );

  emitResize(width: number, height: number) {
    this.resizeSubject.next({ width, height });
  }
}
