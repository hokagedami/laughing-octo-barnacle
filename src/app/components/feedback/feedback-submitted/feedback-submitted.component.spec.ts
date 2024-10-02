import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSubmittedComponent } from './feedback-submitted.component';

describe('FeedbackSubmittedComponent', () => {
  let component: FeedbackSubmittedComponent;
  let fixture: ComponentFixture<FeedbackSubmittedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackSubmittedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
