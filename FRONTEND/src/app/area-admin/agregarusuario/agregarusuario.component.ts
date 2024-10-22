import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { data } from 'jquery';
import { Usuario } from 'src/app/Modelo/Usuario';
import { UsuariosService } from 'src/app/Service/usuarios.service';

@Component({
  selector: 'app-agregarusuario',
  templateUrl: './agregarusuario.component.html',
  styleUrls: ['./agregarusuario.component.css']
})
export class AgregarusuarioComponent {
  constructor(private serviciousuario:UsuariosService){}

  newUser:Usuario = new Usuario();
  confirmPassword!:string
  crearNuevoUsuario(formNewuser:any){
    console.log(this.newUser)
    this.serviciousuario.postUsuario(this.newUser).subscribe(data=>{
      alert("Se ha guardado el nuevo usuario");
      formNewuser.resetForm();
      this.newUser= new Usuario();
    })
  }
}
