import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Figurinha } from './figurinha';

describe('Figurinha', () => {
  let component: Figurinha;
  let fixture: ComponentFixture<Figurinha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Figurinha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Figurinha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
