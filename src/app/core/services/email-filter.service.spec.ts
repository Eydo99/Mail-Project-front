import { TestBed } from '@angular/core/testing';

import { EmailFilterService } from './email-filter.service';

describe('EmailFilterService', () => {
  let service: EmailFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
