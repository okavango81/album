import { TestBed } from '@angular/core/testing';

import { Sticker } from './sticker';

describe('Sticker', () => {
  let service: Sticker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sticker);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
