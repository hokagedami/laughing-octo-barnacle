import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { CookieService } from 'ngx-cookie-service';
import { EventService } from './services/event/event.service';
import { Platform } from '@angular/cdk/platform';
import { BehaviorSubject } from 'rxjs';
import {AuthService} from "./services/auth/auth.service";
import {HeaderComponent} from "./components/header/header.component";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let cookieServiceMock: jasmine.SpyObj<CookieService>;
  let eventServiceMock: jasmine.SpyObj<EventService>;
  let platformMock: jasmine.SpyObj<Platform>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let resizeObservable: BehaviorSubject<Event>;

  beforeEach(async () => {
    cookieServiceMock = jasmine.createSpyObj('CookieService', ['deleteAll', 'check', 'get', 'set', 'delete']);
    eventServiceMock = jasmine.createSpyObj('EventService', ['emitResize']);
    platformMock = jasmine.createSpyObj('Platform', [], {
      IOS: false,
      ANDROID: false
    });
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    resizeObservable = new BehaviorSubject<Event>(new Event('resize'));

    await TestBed.configureTestingModule({
      imports: [AppComponent, HeaderComponent],
      providers: [
        provideRouter([], withComponentInputBinding()),
        provideLocationMocks(),
        { provide: CookieService, useValue: cookieServiceMock },
        { provide: EventService, useValue: eventServiceMock },
        { provide: Platform, useValue: platformMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    spyOn(window, 'addEventListener').and.callFake((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'resize') {
        resizeObservable.subscribe((event) => {
          if (typeof listener === 'function') {
            listener(event);
          } else {
            listener.handleEvent(event);
          }
        });
      }
    });
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title).toEqual('logic-gate');
  });

  it('should delete all cookies on initialization', () => {
    fixture.detectChanges();
    expect(cookieServiceMock.deleteAll).toHaveBeenCalled();
  });

  it('should check screen size on initialization', () => {
    spyOn(component as any, 'checkScreenSize');
    fixture.detectChanges();
    expect((component as any).checkScreenSize).toHaveBeenCalled();
  });

  it('should emit initial size on initialization', () => {
    fixture.detectChanges();
    expect(eventServiceMock.emitResize).toHaveBeenCalledWith(true);
  });

  it('should update isNotSuitableScreen based on window width', fakeAsync(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {value: 1200, writable: true});
    fixture.detectChanges();
    expect(component.isNotSuitableScreen).toBeFalse();

    // Simulate resize to smaller screen
    Object.defineProperty(window, 'innerWidth', {value: 800});
    resizeObservable.next(new Event('resize'));
    tick(200); // Account for debounce time
    fixture.detectChanges();

    expect(component.isNotSuitableScreen).toBeTrue();
    expect(eventServiceMock.emitResize).toHaveBeenCalledWith(true);
  }));

  it('should update isNotSuitableScreen based on platform', () => {
    Object.defineProperty(window, 'innerWidth', {value: 900, writable: true});

    // Test for iOS
    Object.defineProperty(platformMock, 'IOS', {get: () => true});
    fixture.detectChanges();
    expect(component.isNotSuitableScreen).toBeTrue();

    // Test for Android
    Object.defineProperty(platformMock, 'IOS', {get: () => false});
    Object.defineProperty(platformMock, 'ANDROID', {get: () => true});
    fixture.detectChanges();
    expect(component.isNotSuitableScreen).toBeTrue();

    // Test for non-mobile platform
    Object.defineProperty(platformMock, 'ANDROID', {get: () => false});
    fixture.detectChanges();
    expect(component.isNotSuitableScreen).toBeTrue();
  });
});
