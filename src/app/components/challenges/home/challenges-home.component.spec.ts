import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengesHomeComponent } from './challenges-home.component';

describe('HomeComponent', () => {
  let component: ChallengesHomeComponent;
  let fixture: ComponentFixture<ChallengesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengesHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
