import { Component , OnInit , HostListener  } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../auth/auth.service';
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
    private authService:AuthService
  ){}

  async ngOnInit() {
    const userData = await this.userService.getUserData();
    if (userData) {
      this.role = userData.role; 
    }
    this.checkScreenSize();
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
