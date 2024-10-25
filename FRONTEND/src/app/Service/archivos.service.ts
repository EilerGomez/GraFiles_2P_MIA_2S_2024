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
  getArchivos(idFM:string){
    return this.http.get<Archivos[]>(`${this.Url}/${idFM}`);
  }

  postArchivo(nombre:string, extension:string, contenido:string, idFM:string){
    const body = { extension, nombre, contenido, idFM };
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
  putMoverArchivo(idA:string, nombre:string, idFM:string, extension:string) {
    return this.http.put<any>(`${this.Url}/mover/${idA}`, {idFM, nombre, extension});
  }
}
