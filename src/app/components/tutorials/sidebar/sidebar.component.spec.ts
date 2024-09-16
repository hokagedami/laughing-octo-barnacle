import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { LessonsService } from '../../../services/lessons/lessons.service';
import { Lesson } from '../../../models/lesson.model';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let lessonsServiceSpy: jasmine.SpyObj<LessonsService>;

  const mockLessons: Lesson[] = [
    { code: 'L1', title: 'Lesson 1', content: { title: 'Lesson 1', paragraphs: [], images: [], tables: [] } },
    { code: 'L2', title: 'Lesson 2', content: { title: 'Lesson 2', paragraphs: [], images: [], tables: [] } },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('LessonsService', ['getLessons']);

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
      providers: [
        { provide: LessonsService, useValue: spy }
      ]
    }).compileComponents();

    lessonsServiceSpy = TestBed.inject(LessonsService) as jasmine.SpyObj<LessonsService>;
    lessonsServiceSpy.getLessons.and.returnValue(mockLessons);

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load lessons from LessonsService', () => {
    expect(lessonsServiceSpy.getLessons).toHaveBeenCalled();
    expect(component.lessons).toEqual(mockLessons);
  });

  it('should display lessons in the sidebar', () => {
    const lessonElements = fixture.debugElement.queryAll(By.css('.scrollable-list li'));
    expect(lessonElements.length).toBe(mockLessons.length);
    lessonElements.forEach((el, index) => {
      expect(el.nativeElement.textContent).toContain(mockLessons[index].title);
    });
  });

  it('should emit lessonCodeChange event when navigate is called', () => {
    spyOn(component.lessonCodeChange, 'emit');
    const testCode = 'L1';
    component.navigate(testCode);
    expect(component.lessonCodeChange.emit).toHaveBeenCalledWith(testCode);
  });

  it('should have correct CSS classes', () => {
    const sidebarElement = fixture.debugElement.query(By.css('.bg-dark'));
    expect(sidebarElement).toBeTruthy();
    expect(sidebarElement.classes['text-white']).toBeTrue();
    expect(sidebarElement.classes['p-3']).toBeTrue();

    const scrollableListElement = fixture.debugElement.query(By.css('.scrollable-list'));
    expect(scrollableListElement).toBeTruthy();
  });
});
