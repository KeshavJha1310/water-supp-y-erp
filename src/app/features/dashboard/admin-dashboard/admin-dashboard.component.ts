import { Component , OnInit , OnDestroy , ViewChild, HostListener } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { UserService } from '../../../core/services/user.service';
import { OrderServiceService } from '../../../core/services/order-service.service';
@Component({
  selector: 'app-admin-dashboard',
  standalone:false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit,OnDestroy{

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private orderService: OrderServiceService
  ){}

  selectedComponent = 'orders';
  isMenuOpen :boolean=true;
  isMobile = window.innerWidth < 768;

 async ngOnInit(): Promise<void> {

    const user = await this.userService.getCurrentUser();
    if(user?.uid){
      console.log(user?.uid)
      this.orderService.listenToOrders(user?.uid)
    }
  }
  
  loadComponent(componentName: string) {
    this.selectedComponent = componentName;
    if (window.innerWidth <= 768) {
      this.sidenav.close();
      this.isMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
    this.isMenuOpen = !this.isMobile;
  }

  toggleMenuAndCloseIcon() {
    this.isMenuOpen = !this.isMenuOpen;
    this.sidenav.toggle();
  }

  ngOnDestroy(): void {

  }

}
