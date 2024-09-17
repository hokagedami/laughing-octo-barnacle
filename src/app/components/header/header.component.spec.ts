import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter, Route } from '@angular/router';
import {StartComponent} from "../start/start.component";
import {TutorialHomeComponent} from "../tutorials/tutorial-home/tutorial-home.component";
const routes: Route[] = [
  { path: '', component: StartComponent },
  { path: 'tutorials', component: TutorialHomeComponent }
];

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        StartComponent,
        TutorialHomeComponent
      ],
      providers: [
        provideRouter(routes), // Provide mock routes
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateLoginStatus on ngOnInit', () => {
    spyOn(component as any, 'updateLoginStatus');
    component.ngOnInit();
    expect(component.updateLoginStatus).toHaveBeenCalled();
  });

  it('should call updateLoginStatus on NavigationEnd event', () => {
    spyOn(component as any, 'updateLoginStatus');
    component.ngOnInit();
    component.router.navigate(['/']);
    expect(component.updateLoginStatus).toHaveBeenCalled();
  });

  it('should call updateLoginStatus on NavigationEnd event', () => {
    spyOn(component as any, 'updateLoginStatus');
    component.ngOnInit();
    component.router.navigate(['/challenges']);
    expect(component.updateLoginStatus).toHaveBeenCalled();
  });

  it('should call unsubscribe on ngOnDestroy', () => {
    spyOn(component.routerSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.routerSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should update login status', () => {
    component.updateLoginStatus();
    expect(component.isLoggedIn).toBeFalse();
  });

});
