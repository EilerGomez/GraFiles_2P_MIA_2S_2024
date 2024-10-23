import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { LoginService } from './Service/login.service';
import { ManagerHomepageComponent } from './manager-homepage/manager-homepage.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AreaAdminComponent } from './area-admin/area-admin.component';
import { UsuariosComponent } from './area-admin/usuarios/usuarios.component'
import { UsuariosService } from './Service/usuarios.service';
import { AgregarusuarioComponent } from './area-admin/agregarusuario/agregarusuario.component';
import { CambioPasswordComponent } from './cambio-password/cambio-password.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { CarpetaComponent } from './carpeta/carpeta.component';
import { CarpetasService } from './Service/carpetas.service';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ManagerHomepageComponent,
    NavbarComponent,
    AreaAdminComponent,
    UsuariosComponent,
    AgregarusuarioComponent,
    CambioPasswordComponent,
    BreadcrumbComponent,
    CarpetaComponent    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [ LoginService, UsuariosService, CarpetasService],
  bootstrap: [AppComponent]
})
export class AppModule { }
