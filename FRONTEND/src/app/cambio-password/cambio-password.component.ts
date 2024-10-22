import { Component } from '@angular/core';
import { UsuariosService } from '../Service/usuarios.service';
import { NgForm } from '@angular/forms';
import { Usuario } from '../Modelo/Usuario';
import { data, error } from 'jquery';
@Component({
  selector: 'app-cambio-password',
  templateUrl: './cambio-password.component.html',
  styleUrls: ['./cambio-password.component.css']
})
export class CambioPasswordComponent {

  constructor(private serviciousuarios:UsuariosService){}
  oldPassword!:string
  newPassword!:string
  confirmPassword!:string
  cambiarContrasenia(form:NgForm){
    console.log(this.oldPassword  + ", " + this.newPassword)
    this.serviciousuarios.putPassword(this.oldPassword,this.newPassword,this.getIDUser()).subscribe(data=>{
      console.log(data);
      alert("Se ha cambiado la contraseña exitosamente");
      form.resetForm()
    }, error=>{
      console.log(error)
    })
  }

  getIDUser(){
    let stringUser = localStorage.getItem('usuario');
    let usuario:Usuario = stringUser? JSON.parse(stringUser):null;
    let id = usuario? usuario._id:'0';
    return id;
  }
}
