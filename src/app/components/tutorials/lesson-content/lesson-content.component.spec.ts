import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonContentComponent } from './lesson-content.component';

describe('ComponentsComponent', () => {
  let component: LessonContentComponent;
  let fixture: ComponentFixture<LessonContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
