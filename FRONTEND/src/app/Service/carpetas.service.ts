import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Carpeta } from '../Modelo/Carpeta';

@Injectable({
  providedIn: 'root'
})
export class CarpetasService {

  constructor(private http: HttpClient) { }
  Url = 'http://localhost:3010/carpetas';
  getCarpetaRaiz(){
    return this.http.get<Carpeta>(`${this.Url}/carpeta-raiz`);
  }

  getCarpetasDeCarpeta(idU:string, idC:string){
    return this.http.get<Carpeta[]>(`${this.Url}/${idU}/${idC}`);
  }

  postCarpeta(nombre: string, idU: string, ficheroMadre: string) {
    const body = { nombre, idU, ficheroMadre };
    return this.http.post(`${this.Url}`, (body));
  }



 /* putUsuario(usuario: Usuario) {
    return this.http.put<Usuario>(`${this.Url}/${usuario._id}`, usuario);
  }
  putPassword(oldPassword: string, newPassword: string, id: string) {
    return this.http.put<any>(`${this.Url}/update-password/${id}`, 
        { oldPassword: oldPassword, newPassword: newPassword }); 
  }
  /*
  deleteUsuario(usuario: Usuario, rol: number) {
    return this.http.delete(`${this.Url}/${usuario.identificacion}?roldb=${rol}`);
  }
  postUsuario(usuario:Usuario){
    return this.http.post(`${this.Url}`,usuario);
  }*/
}
