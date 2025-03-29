import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewOrderModelComponent } from './new-order-model.component';

describe('NewOrderModelComponent', () => {
  let component: NewOrderModelComponent;
  let fixture: ComponentFixture<NewOrderModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOrderModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewOrderModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
