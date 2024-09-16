import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LessonContentComponent } from './lesson-content.component';
import { LessonsService } from '../../../services/lessons/lessons.service';
import { Lesson } from '../../../models/lesson.model';
import { By } from '@angular/platform-browser';
import { SimpleChange } from '@angular/core';

describe('LessonContentComponent', () => {
  let component: LessonContentComponent;
  let fixture: ComponentFixture<LessonContentComponent>;
  let lessonsServiceSpy: jasmine.SpyObj<LessonsService>;

  const mockLessons: Lesson[] = [
    {
      code: 'intro',
      title: 'Introduction',
      content: {
        title: 'Introduction',
        paragraphs: ['Intro paragraph'],
        images: ['intro.jpg'],
        tables: [{ title: 'Intro Table', columns: ['Col1'], data: [['Data1']] }]
      }
    },
    {
      code: 'L1',
      title: 'Lesson 1',
      content: {
        title: 'Lesson 1',
        paragraphs: ['L1 paragraph'],
        images: [],
        tables: null
      }
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('LessonsService', ['getLessons', 'getLesson']);

    await TestBed.configureTestingModule({
      imports: [LessonContentComponent],
      providers: [
        { provide: LessonsService, useValue: spy }
      ]
    }).compileComponents();

    lessonsServiceSpy = TestBed.inject(LessonsService) as jasmine.SpyObj<LessonsService>;
    lessonsServiceSpy.getLessons.and.returnValue(mockLessons);
    lessonsServiceSpy.getLesson.and.callFake((code: string) => mockLessons.find(l => l.code === code));

    fixture = TestBed.createComponent(LessonContentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load lessons and set initial lesson on init', () => {
    fixture.detectChanges();
    expect(lessonsServiceSpy.getLessons).toHaveBeenCalled();
    expect(component.lessons).toEqual(mockLessons);
    expect(component.currentLesson).toEqual(mockLessons[0]);
  });

  it('should change lesson when code input changes', () => {
    component.code = 'L1';
    component.ngOnChanges({
      code: new SimpleChange(null, 'L1', true)
    });
    expect(component.currentLesson).toEqual(mockLessons[1]);
  });

  it('should display lesson title', () => {
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(By.css('h4'));
    expect(titleElement.nativeElement.textContent).toContain(mockLessons[0].title);
  });

  it('should display lesson paragraphs', () => {
    fixture.detectChanges();
    const contentElement = fixture.debugElement.query(By.css('.content'));
    expect(contentElement.nativeElement.textContent).toContain(mockLessons[0].content.paragraphs[0]);
  });

  it('should show images section when images are present', () => {
    fixture.detectChanges();
    const imageElements = fixture.debugElement.queryAll(By.css('img'));
    expect(imageElements.length).toBe(mockLessons[0].content.images.length);
  });

  it('should show tables section when tables are present', () => {
    fixture.detectChanges();
    const tableElements = fixture.debugElement.queryAll(By.css('table'));
    expect(tableElements.length).toBe(mockLessons[0].content.tables?.length || 0);
  });

  it('should not show tables section when tables are null', () => {
    component.code = 'L1';
    component.ngOnChanges({
      code: new SimpleChange(null, 'L1', true)
    });
    fixture.detectChanges();
    const tableElements = fixture.debugElement.queryAll(By.css('table'));
    expect(tableElements.length).toBe(0);
  });

  it('should have correct CSS classes', () => {
    fixture.detectChanges();
    const contentElement = fixture.debugElement.query(By.css('.bg-dark'));
    expect(contentElement).toBeTruthy();
    expect(contentElement.classes['text-white']).toBeTrue();
    expect(contentElement.classes['p-3']).toBeTrue();
    expect(contentElement.classes['h-100']).toBeTrue();
  });
});
