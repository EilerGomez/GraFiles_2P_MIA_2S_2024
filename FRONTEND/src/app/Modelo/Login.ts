export class Login{
    username:String;
    password:String;
    rol:String;

    constructor(un:string, password:String, rol:String){
        this.username=un;
        this.password=password;
        this.rol=rol;
    }
    
    public getUserName(){
        return this.username;
    }

    public  setUserName(userName:string){
        this.username=userName;
    }
    public getPassword(){
        return this.password;
    }

    public  setPassword(password:String){
        this.password=password;
    }
    public getArea(){
        return this.rol;
    }

    public  setArea(rol:String){
        this.rol=rol;
    }
    
}