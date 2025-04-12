import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomerModelComponent } from './edit-customer-model.component';

describe('EditCustomerModelComponent', () => {
  let component: EditCustomerModelComponent;
  let fixture: ComponentFixture<EditCustomerModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCustomerModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomerModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
