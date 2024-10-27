import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Archivos } from '../Modelo/Archivos';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {

  constructor(private http: HttpClient) { }
  Url = 'http://localhost:3010/archivos';
  getArchivos(idFM:string, idU:string){
    return this.http.get<Archivos[]>(`${this.Url}/${idFM}/${idU}`);
  }

  getArchivosEliminados(idC:string){
    return this.http.get<Archivos[]>(`${this.Url}/${idC}`);
  }

  getArchivosCompartidos(idFM:string, idU:string){
    return this.http.get<Archivos[]>(`${this.Url}/archivos-compartidos/${idFM}/${idU}`);
  }

  postArchivo(nombre:string, extension:string, contenido:string, idFM:string, idU:string){
    const body = { extension, nombre, contenido, idFM , idU};
    console.log(body)
    return this.http.post(`${this.Url}`, (body));
  }

  pegarArchivo(idArchivo:string, idFM:string){
    const body = { idArchivo, idFM };
    console.log(body)
    return this.http.post(`${this.Url}/copiar`, (body));
  }

  subirArchivo(formData: FormData): Observable<any> {
    return this.http.post(`${this.Url}/upload`, formData);
  }

  obtenerImagen(nombre: string): Observable<any> {
    return this.http.get(`${this.Url}/imagen/${nombre}`, { responseType: 'blob' });
  }
  deleteArchivo(id:string) {
    return this.http.delete(`${this.Url}/${id}`);
  }
  eliminarDelSistema(id:string) {
    return this.http.delete(`${this.Url}/eliminar-del-sistema/${id}`);
  }
  putMoverArchivo(idA:string, nombre:string, idFM:string, extension:string) {
    return this.http.put<any>(`${this.Url}/mover/${idA}`, {idFM, nombre, extension});
  }

  putEditarArchivo(extension:string, nombre:string, contenido:string, idArchivo:string, idFM:string){
    const body = {extension, nombre, contenido, idArchivo, idFM};
    return this.http.put<any>(`${this.Url}/editar`, (body));
  }

  actualizarArchivoImagen(formData: FormData): Observable<any> {
    return this.http.put(`${this.Url}/editararchivoimagen`, formData);
  }

  postCompartirArchivo(idFM:string, idU:string, idUC:string,idA:string){
    const body = { idFM, idU, idUC,idA};
    console.log(body)
    return this.http.post(`${this.Url}/compartir`, (body));
  }
}
