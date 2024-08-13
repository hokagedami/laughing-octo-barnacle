import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorHomeComponent } from './simulator-home.component';

describe('SimulatorHomeComponent', () => {
  let component: SimulatorHomeComponent;
  let fixture: ComponentFixture<SimulatorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulatorHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulatorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
