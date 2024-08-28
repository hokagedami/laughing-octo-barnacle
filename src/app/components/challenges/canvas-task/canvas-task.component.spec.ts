import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasTaskComponent } from './canvas-task.component';

describe('CanvasTaskComponent', () => {
  let component: CanvasTaskComponent;
  let fixture: ComponentFixture<CanvasTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
