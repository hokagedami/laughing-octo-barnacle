import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialHomeComponent } from './tutorial-home.component';

describe('TutorialHomeComponent', () => {
  let component: TutorialHomeComponent;
  let fixture: ComponentFixture<TutorialHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
