import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorialHomeComponent } from './tutorial-home.component';
import { By } from '@angular/platform-browser';
import {Component, EventEmitter, Input, Output} from "@angular/core";

describe('TutorialHomeComponent', () => {
  let component: TutorialHomeComponent;
  let fixture: ComponentFixture<TutorialHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialHomeComponent],
      declarations: [
        MockLessonContentComponent,
        MockSidebarComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a sidebar component', () => {
    const sidebarElement = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebarElement).toBeTruthy();
  });

  it('should have a lesson-content component', () => {
    const lessonContentElement = fixture.debugElement.query(By.css('lesson-content'));
    expect(lessonContentElement).toBeTruthy();
  });

  it('should update selectedLessonCode when lessonCodeChange event is emitted from sidebar', () => {
    const sidebarElement = fixture.debugElement.query(By.css('app-sidebar'));
    const testLessonCode = 'TEST_LESSON_CODE';

    sidebarElement.triggerEventHandler('lessonCodeChange', testLessonCode);
    fixture.detectChanges();

    expect(component.selectedLessonCode).toBe(testLessonCode);
  });
});

// Mock components
@Component({
  selector: 'lesson-content',
  template: ''
})
class MockLessonContentComponent {
  @Input() code: any;
}

@Component({
  selector: 'app-sidebar',
  template: ''
})
class MockSidebarComponent {
  @Output() lessonCodeChange = new EventEmitter<string>();
}
