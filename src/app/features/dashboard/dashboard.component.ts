import { Component , OnInit , HostListener  } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../auth/auth.service';
import { OrderServiceService } from '../../core/services/order-service.service';
@Component({
  selector: 'app-dashboard',
  standalone:false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  role: string | null = null;
  isMobile = false;
  menuOpen = false;

  constructor(
    private userService:UserService,
    private authService:AuthService,
    private orderService:OrderServiceService
  ){}

  async ngOnInit() {
    const userData = await this.userService.getUserData();
    console.log(userData)
    if (userData) {
      console.log(userData)
      this.role = userData.role; 
    }
    this.checkScreenSize();
  const user = await this.userService.getCurrentUser();
  if(user?.uid){
    this.orderService.listenToOrders(user?.uid)
  }
 
  
  }

  
  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  logout(){
    console.log("called")
    this.authService.logout()
  }

}
