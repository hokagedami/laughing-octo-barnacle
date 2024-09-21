import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private resizeSubject = new Subject<{ smallScreen: boolean }>();

  resizeObservable$: Observable<{ smallScreen: boolean }> = this.resizeSubject.asObservable().pipe(
    debounceTime(200) // Debounce to avoid excessive emissions
  );

  emitResize(smallScreen: boolean = false) {
    this.resizeSubject.next({ smallScreen});
  }
}
