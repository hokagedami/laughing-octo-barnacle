import { TestBed } from '@angular/core/testing';

import { ClaudeService } from './claude.service';

describe('ClaudeService', () => {
  let service: ClaudeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClaudeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
