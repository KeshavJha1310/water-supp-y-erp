import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryStaffComponent } from './delivery-staff.component';

describe('DeliveryStaffComponent', () => {
  let component: DeliveryStaffComponent;
  let fixture: ComponentFixture<DeliveryStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
