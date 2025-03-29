import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import {firebase} from './environments/environment'
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { providePerformance,getPerformance } from '@angular/fire/performance';
import { provideRemoteConfig,getRemoteConfig } from '@angular/fire/remote-config';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { provideRouter, RouterModule, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import {DashboardComponent} from './features/dashboard/dashboard.component'
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from './auth/login/login.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { DeliveryDashboardComponent } from './features/dashboard/delivery-dashboard/delivery-dashboard.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import { CustomerManagementComponent } from './features/dashboard/admin-dashboard/components/customer-management/customer-management.component';
import { ReportsComponent } from './features/dashboard/admin-dashboard/components/reports/reports.component';
import { OrderListComponent } from './features/dashboard/admin-dashboard/components/order-list/order-list.component';
import { DeliveryStaffComponent } from './features/dashboard/admin-dashboard/components/delivery-staff/delivery-staff.component';
@NgModule({
    declarations:[
        AppComponent,
        LoginComponent,
        SignInComponent,
        AdminDashboardComponent,
        DeliveryDashboardComponent,
        DashboardComponent,
        CustomerManagementComponent,
        ReportsComponent,
        OrderListComponent,
        DeliveryStaffComponent
    ], 
    imports:[
        MatListModule,
        MatToolbarModule,
        MatSidenavModule,
        MatIconModule,
        RouterOutlet,
        RouterModule.forRoot(routes),
        BrowserModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        CommonModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ],
    providers:[
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
    ],
    bootstrap:[AppComponent]
})
export class AppModule { }