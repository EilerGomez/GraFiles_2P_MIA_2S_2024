import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../Modelo/Usuario';
@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private http: HttpClient) { }
  Url = 'http://localhost:3010/usuarios';
  getUsuarios(){
    return this.http.get<Usuario[]>(`${this.Url}`);
  }

  putUsuario(usuario: Usuario) {
    return this.http.put<Usuario>(`${this.Url}/${usuario._id}`, usuario);
  }
  putPassword(oldPassword: string, newPassword: string, id: string) {
    return this.http.put<any>(`${this.Url}/update-password/${id}`, 
        { oldPassword: oldPassword, newPassword: newPassword }); 
  }
  /*
  deleteUsuario(usuario: Usuario, rol: number) {
    return this.http.delete(`${this.Url}/${usuario.identificacion}?roldb=${rol}`);
  }*/
  postUsuario(usuario:Usuario){
    return this.http.post(`${this.Url}`,usuario);
  }
}
