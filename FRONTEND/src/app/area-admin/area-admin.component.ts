import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../Service/login.service';

@Component({
  selector: 'app-area-admin',
  templateUrl: './area-admin.component.html',
  styleUrls: ['../css/main.css']
})
export class AreaAdminComponent {
  constructor(private router: Router, private service: LoginService) { }

  logOut() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('area');
    this.router.navigate(['homepage']);
    this.service.putCerrarConexionDB("a").subscribe(data=>{
      console.log(data)

    }, error=>{console.log(error)});
  }
}
