import { Injectable } from '@angular/core';
import { Login } from '../Modelo/Login';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  url = 'http://localhost:3010/connect';
  admin: any;
  jsonContent: string;
  constructor(private http: HttpClient) {
    this.jsonContent='';
  }
  

   getLogin(login:Login ){
      this.jsonContent=login.toString();
      const httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
            })
        };
    /*this.http.post(this.url, this.jsonContent, httpOptions)
          .subscribe(response => console.log(response));*/
          this.jsonContent=JSON.stringify({ username: login.getUserName(), password: login.getPassword()});
          console.log(this.jsonContent);
          /*this.http.post(this.url, this.jsonContent, httpOptions)
          .subscribe(response => {console.log(response)          
        });*/

          
          return  this.http.post(this.url, this.jsonContent, httpOptions)
   }

   putCerrarConexionDB(cerrar:String){
    const httpOptions = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json'
          })
      };
      return  this.http.post('http://localhost:3010/disconnect',JSON.stringify({a:cerrar}))
   }
}
