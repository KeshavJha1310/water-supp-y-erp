import { Component ,
  HostListener, ChangeDetectorRef,
  OnInit ,OnDestroy } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
@Component({
  selector: 'app-delivery-order-list',
standalone:false,
  templateUrl: './delivery-order-list.component.html',
  styleUrl: './delivery-order-list.component.scss'
})
export class DeliveryOrderListComponent implements OnInit , OnDestroy {
  isMenuOpen: boolean = false;
  isMobile = window.innerWidth < 921;
  isTab = window.innerWidth < 900;
  constructor(
    private cdRef: ChangeDetectorRef,
    private userSerivce : UserService,
  ){

  }
  
ngOnInit(): void {
  
}



ngOnDestroy(): void {
  
}
}
