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

  getCarpetaCompartida(){
    return this.http.get<Carpeta>(`${this.Url}/carpeta-compartida`);
  }

  getCarpetasDeCarpeta(idU:string, idC:string){
    return this.http.get<Carpeta[]>(`${this.Url}/${idU}/${idC}`);
  }

  getCarpetasDeCarpetaEliminadas(idU:string, idC:string){
    return this.http.get<Carpeta[]>(`${this.Url}/eliminadas/${idU}/${idC}`);
  }



  postCarpeta(nombre: string, idU: string, ficheroMadre: string) {
    const body = { nombre, idU, ficheroMadre };
    return this.http.post(`${this.Url}`, (body));
  }
  putNombreCarpeta(idC:string, nombre:string, ficheroMadre:string) {
    return this.http.put<any>(`${this.Url}/nombre-actualizar/${idC}`, {nombre,ficheroMadre});
  }

  deleteCarpeta(idC:string) {
    return this.http.delete(`${this.Url}/${idC}`);
  }

  eliminarDelSistema(idC:string) {
    return this.http.delete(`${this.Url}/eliminar-sistema/${idC}`);
  }

  postCopiarCarpeta(nombre: string, idU: string, ficheroMadre: string, idFM:string) {
    const body = { nombre, idU, ficheroMadre };
    return this.http.post(`${this.Url}/copiar-carpeta/${idFM}`, (body));
  }
  putMoverCarpeta(idC:string, nombre:string, nuevoFicheroMadre:string) {
    return this.http.put<any>(`${this.Url}/mover_carpeta/${idC}`, {nombre,nuevoFicheroMadre});
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
