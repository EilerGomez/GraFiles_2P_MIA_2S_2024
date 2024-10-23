import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { ManagerHomepageComponent } from './manager-homepage/manager-homepage.component'
import { AreaAdminComponent } from './area-admin/area-admin.component';
import { UsuariosComponent } from './area-admin/usuarios/usuarios.component';
import { AgregarusuarioComponent } from './area-admin/agregarusuario/agregarusuario.component';
import { CambioPasswordComponent } from './cambio-password/cambio-password.component';
import { CarpetaComponent } from './carpeta/carpeta.component';

const routes: Routes = [

  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: 'homepage', component: ManagerHomepageComponent },
  { path: 'login', component: LoginComponent },
  {path:'areaAdministrador', component:AreaAdminComponent,
    children:[{
      path:'usuarios',component:UsuariosComponent},
      {path:'nuevoUsuario', component:AgregarusuarioComponent},
      {path:'cambioPassword',component:CambioPasswordComponent},
      {path:'carpetas', component:CarpetaComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
