import { Component,
  HostListener, ChangeDetectorRef,
    OnInit 
  ,OnDestroy } from '@angular/core';

@Component({
  selector: 'app-delivery-dashboard',
  standalone:false,
  templateUrl: './delivery-dashboard.component.html',
  styleUrl: './delivery-dashboard.component.scss'
})
export class DeliveryDashboardComponent implements OnInit ,OnDestroy {
  isMenuOpen: boolean = false;
  isMobile = window.innerWidth < 921;
  isTab = window.innerWidth < 900;
  constructor(
    private cdRef: ChangeDetectorRef,

  ){

  }
  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }
}
