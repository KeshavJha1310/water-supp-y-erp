import {
  Component, OnInit,
  OnDestroy, ViewChild,
  HostListener, ChangeDetectorRef,
  TemplateRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup, FormArray,
  Validators
} from '@angular/forms';

import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { UserService } from '../../../core/services/user.service';
import { OrderServiceService } from '../../../core/services/order-service.service';
@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  buildingForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private orderService: OrderServiceService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.buildingForm = this.fb.group({
      buildings: this.fb.array([this.createBuildingGroup()])
    });
  }

  selectedComponent = 'orders';
  isMenuOpen: boolean = false;
  isMobile = window.innerWidth < 921;
  isTab = window.innerWidth < 900;

  async ngOnInit(): Promise<void> {

    const user = await this.userService.getCurrentUser();
    if (user?.uid) {
      console.log(user?.uid)
      this.orderService.listenToOrders(user?.uid);
    }
    this.userService.back$.subscribe((flag:boolean)=>{
      if(flag){
        this.selectedComponent = 'orders';
      }
    })
    // this.orderService.clearAllOrders();
  }

  openDialog(templateRef: TemplateRef<any>) {
    const dialogRef = this.dialog.open(templateRef, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.resetFormToDefault();  // <-- Reset the form when dialog is closed
    });
  }
  removeBuildingField(): void {
    const length = this.buildings.length;
    if (length > 1) {
      this.buildings.removeAt(length - 1); // removes the last added input
    }
  }
  resetFormToDefault(): void {
    const buildingsArray = this.buildingForm.get('buildings') as FormArray;
    while (buildingsArray.length !== 0) {
      buildingsArray.removeAt(0);
    }
    buildingsArray.push(this.createBuildingGroup());
    this.buildingForm.markAsPristine();
    this.buildingForm.markAsUntouched();
  }

  get buildings(): FormArray {
    return this.buildingForm.get('buildings') as FormArray;
  }

  createBuildingGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required]
    });
  }

  addBuildingField(): void {
    this.buildings.push(this.createBuildingGroup());
  }

  async submitBuilding(): Promise<void> {
    if (this.buildingForm.valid) {
      const buildings = this.buildingForm.value.buildings
        .map((b: any) => b.name.trim())
        .filter((name: string) => name); // Remove empty names
  
      if (buildings.length === 0) return;
  
      await this.orderService.saveBuildingNames(buildings);
  
      console.log('Building names saved:', buildings);
      this.dialog.closeAll();
    }
  }
  
  

  loadComponent(componentName: string) {
    this.selectedComponent = componentName;
    if (window.innerWidth <= 921) {
      this.sidenav.close();
      this.isMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 921;
    this.cdRef.detectChanges();
    this.isMenuOpen = !this.isMobile;
    this.cdRef.detectChanges();
  }

  toggleMenuAndCloseIcon() {
    this.isMenuOpen = !this.isMenuOpen;
    this.sidenav.toggle();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {

  }

}
