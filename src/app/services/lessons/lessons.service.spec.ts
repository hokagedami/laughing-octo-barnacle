import { TestBed } from '@angular/core/testing';
import { LessonsService } from './lessons.service';
import { Lesson } from '../../models/lesson.model';
import {Content} from "../../models/lesson.content.model";

describe('LessonsService', () => {
  let service: LessonsService;
  let mockLessons: Lesson[];

  beforeEach(() => {
    const mockContent: Content = {
      title: 'Sample Lesson',
      paragraphs: ['This is paragraph 1', 'This is paragraph 2'],
      images: ['image1.jpg', 'image2.jpg'],
      tables: [
        {
          title: 'Sample Table',
          columns: ['Column 1', 'Column 2'],
          data: [
            ['Row 1, Col 1', 'Row 1, Col 2'],
            ['Row 2, Col 1', 'Row 2, Col 2']
          ]
        }
      ]
    };

    mockLessons = [
      { code: 'L1', title: 'Lesson 1', content: mockContent },
      { code: 'L2', title: 'Lesson 2', content: { ...mockContent, title: 'Lesson 2 Content' } },
      { code: 'L3', title: 'Lesson 3', content: { ...mockContent, title: 'Lesson 3 Content' } },
    ];

    TestBed.configureTestingModule({
      providers: [LessonsService]
    });
    service = TestBed.inject(LessonsService);

    // Mock the loadLessons method to use our mockLessons
    spyOn<any>(service, 'loadLessons').and.callFake(() => {
      (service as any).lessons = mockLessons;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLessons', () => {
    it('should return all lessons', () => {
      const lessons = service.getLessons();
      expect(lessons).toEqual(mockLessons);
      expect(service['loadLessons']).toHaveBeenCalled();
    });
  });

  describe('getLesson', () => {
    it('should return a lesson by code', () => {
      const lesson = service.getLesson('L2');
      expect(lesson).toEqual(mockLessons[1]);
      expect(service['loadLessons']).toHaveBeenCalled();
    });

    it('should return undefined for non-existent lesson code', () => {
      const lesson = service.getLesson('L4');
      expect(lesson).toBeUndefined();
      expect(service['loadLessons']).toHaveBeenCalled();
    });

    it('should return a lesson with correct content structure', () => {
      const lesson = service.getLesson('L1');
      expect(lesson).toBeDefined();
      expect(lesson?.content).toBeDefined();
      expect(lesson?.content.title).toBe('Sample Lesson');
      expect(lesson?.content.paragraphs).toBeInstanceOf(Array);
      expect(lesson?.content.images).toBeInstanceOf(Array);
      expect(lesson?.content.tables).toBeInstanceOf(Array);
    });
  });

  describe('getLessonsCodes', () => {
    it('should return all lesson codes', () => {
      const codes = service.getLessonsCodes();
      expect(codes).toEqual(['L1', 'L2', 'L3']);
      expect(service['loadLessons']).toHaveBeenCalled();
    });
  });
});
