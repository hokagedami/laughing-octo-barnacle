import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should display the correct copyright text', () => {
    const footerElement: HTMLElement = fixture.nativeElement;
    const pElement = footerElement.querySelector('p');
    expect(pElement?.textContent).toContain(`© ${component.currentYear} LogicPulse. All Rights Reserved.`);
  });

  it('should have the correct CSS classes', () => {
    const footerElement: HTMLElement = fixture.nativeElement.querySelector('footer');
    expect(footerElement.classList.contains('bg-dark')).toBeTruthy();
    expect(footerElement.classList.contains('text-light')).toBeTruthy();
    expect(footerElement.classList.contains('py-3')).toBeTruthy();
  });

  it('should have a container div', () => {
    const containerDiv = fixture.debugElement.query(By.css('.container'));
    expect(containerDiv).toBeTruthy();
  });

  it('should have a centered text', () => {
    const centeredDiv = fixture.debugElement.query(By.css('.col-12.text-center'));
    expect(centeredDiv).toBeTruthy();
  });

  it('should update year when currentYear is changed', () => {
    component.currentYear = 2025;
    fixture.detectChanges();
    const footerElement: HTMLElement = fixture.nativeElement;
    const pElement = footerElement.querySelector('p');
    expect(pElement?.textContent).toContain('© 2025 LogicPulse. All Rights Reserved.');
  });
});
