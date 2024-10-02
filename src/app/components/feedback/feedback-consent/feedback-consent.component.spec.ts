import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackConsentComponent } from './feedback-consent.component';

describe('FeedbackConsentComponent', () => {
  let component: FeedbackConsentComponent;
  let fixture: ComponentFixture<FeedbackConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackConsentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
