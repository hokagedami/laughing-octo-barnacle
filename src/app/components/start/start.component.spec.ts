import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartComponent } from './start.component';
import { provideRouter } from '@angular/router';

describe('StartComponent', () => {
  let component: StartComponent;
  let fixture: ComponentFixture<StartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ StartComponent ],  // Import instead of declare if it's a standalone component
      providers: [
        provideRouter([])  // Provide empty router configuration
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // test page has h1 with 'Welcome to LogicPulse' text
  it('should have h1 with "Welcome to LogicPulse" text', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toEqual('Welcome to LogicPulse');
  });

  // test page has button with 'Start Learning' text
  it('should have button with "Start Learning" text', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.textContent).toEqual('Start Learning');
  });

  // test page has button with 'Start Designing' text
  it('should have three buttons for navigation', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toEqual(3);
  });

  // test page has button with 'Start Learning' text and routerLink to /tutorials
  it('should have button with "Start Learning" text and routerLink to /tutorials', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const button = Array.from(buttons).find((b: any) => b.textContent === 'Start Learning') as HTMLButtonElement;
    expect(button.textContent).toEqual('Start Learning');
    expect(button.getAttribute('routerLink')).toEqual('/tutorials');
  });

  // test page has button with 'Take Challenge' text and routerLink to /challenges
  it('should have button with "Take Challenge" text and routerLink to /challenges', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const button = Array.from(buttons).find((b: any) => b.textContent === 'Take Challenge') as HTMLButtonElement;
    expect(button.textContent).toEqual('Take Challenge');
    expect(button.getAttribute('routerLink')).toEqual('/challenges');
  });

  // test page has button with 'Start Designing' text and routerLink to /simulator
  it('should have button with "Start Designing" text and routerLink to /simulator', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const button = Array.from(buttons).find((b: any) => b.textContent === 'Start Designing') as HTMLButtonElement;
    expect(button.textContent).toEqual('Start Designing');
    expect(button.getAttribute('routerLink')).toEqual('/simulator');
  });
});

