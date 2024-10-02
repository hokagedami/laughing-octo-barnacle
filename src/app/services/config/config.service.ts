import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = {
    apiUrl: 'https://api.example.com',
    theme: 'light',
    itemsPerPage: 10,
    enableNotifications: true,
    debugMode: false
  };

  constructor() {}

  getConfig(): Observable<any> {
    return of(this.config);
  }

  updateConfig(newConfig: any): Observable<any> {
    this.config = { ...this.config, ...newConfig };
    return of(this.config);
  }

  resetConfig(): void {
    this.config = {
      apiUrl: 'https://api.example.com',
      theme: 'light',
      itemsPerPage: 10,
      enableNotifications: true,
      debugMode: false
    };
  }
}
