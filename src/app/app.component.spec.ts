import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([], withComponentInputBinding()),
        provideLocationMocks()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'logic-gate' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('logic-gate');
  });

});
