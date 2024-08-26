import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorCanvasComponent } from './simulator-canvas.component';

describe('SimulatorCanvasComponent', () => {
  let component: SimulatorCanvasComponent;
  let fixture: ComponentFixture<SimulatorCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulatorCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulatorCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
