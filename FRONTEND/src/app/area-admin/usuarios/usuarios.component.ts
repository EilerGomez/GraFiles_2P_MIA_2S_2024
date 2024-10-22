import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { data, error } from 'jquery';
import { Usuario } from 'src/app/Modelo/Usuario';
import { UsuariosService } from 'src/app/Service/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  constructor(private serviciousuario:UsuariosService){}
  usuarios!:Usuario[]
  userEdit:Usuario= new Usuario();
  confirmPassword:string=""
  mostrarEdit:boolean=false;
  ngOnInit():void{
    this.mostrarEdit=false
    this.traerUsuarios()
    
  }

  traerUsuarios(){
    this.serviciousuario.getUsuarios().subscribe(data=>{
      console.log(data);
      this.usuarios=data
    }, error=>{
      console.log(error)
    })
  }
  getRol(rol: number): string {
    return rol === 1 ? 'Admin' : 'Empleado';
  }

  actualizarUsuario(nuevoUserForm:NgForm){
    this.serviciousuario.putUsuario(this.userEdit).subscribe(data=>{
      alert("Usuario actualizado correctamente")
      nuevoUserForm.resetForm()
      this.ngOnInit();
    }, error=>{
      console.log(error)
    })
  }

  editarUsuario(usuario:Usuario){
    this.userEdit=usuario;    
    this.userEdit.password=''
    this.mostrarEdit=true
  }
  cancelarEdicion(){
    this.ngOnInit();
  }

}
