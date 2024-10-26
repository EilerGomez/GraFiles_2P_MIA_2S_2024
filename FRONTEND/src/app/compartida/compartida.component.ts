import { Component, HostListener } from '@angular/core';
import { Archivos } from '../Modelo/Archivos';
import { Usuario } from '../Modelo/Usuario';
import { ArchivosService } from '../Service/archivos.service';
import { CarpetasService } from '../Service/carpetas.service';
import { Carpeta } from '../Modelo/Carpeta';
import { data, error } from 'jquery';

@Component({
  selector: 'app-compartida',
  templateUrl: './compartida.component.html',
  styleUrls: ['./compartida.component.css']
})
export class CompartidaComponent {
  constructor(private servicioArchivos:ArchivosService, private servicioCarpetas:CarpetasService){}

  isCarpeta!: boolean
  objetoCopiado: any
  archivos: Archivos[] = [];
  carpetaCompartida!:Carpeta
  menuTop: number = 0;
  menuLeft: number = 0;
  mostrarmenu: boolean = false;

  modalArchivos: string = '';
  selectedExtension: string = ''
  modalDetalles: boolean = false

  selectedImage: string | null = null; // Almacena la imagen seleccionada
  ngOnInit(): void {
    this.traerCarpetaCompartida();
  }

  traerArchivosdeCarpetaCompartida(){
    this.servicioArchivos.getArchivosCompartidos(this.carpetaCompartida._id,this.getIDUser()).subscribe(data=>{
      this.archivos=data;
      console.log(data)
    }, error=>{console.log(error)})
  }
  traerCarpetaCompartida() {
    this.servicioCarpetas.getCarpetaCompartida().subscribe(data => {
      console.log(data)
      this.carpetaCompartida = data;
      this.traerArchivosdeCarpetaCompartida();

    })
  }
  mostrarArchivo(archivo: Archivos) {
    if (archivo.extension === '.html' || archivo.extension === '.txt') {
      this.modalArchivos = archivo.contenido;
      this.selectedExtension = archivo.extension
    } else {
      this.selectedImage = `http://localhost:3010/archivos/imagen/${archivo.contenido}`; // Asegúrate de que esto apunte correctamente a tu servidor
    }
  }

  getFileIconClass(extension: string): string {
    switch (extension) {
      case '.html':
        return 'bi bi-file-earmark-code-fill'; // Ícono para archivos HTML
      case '.txt':
        return 'bi bi-file-earmark-text-fill'; // Ícono para archivos TXT
      case '.jpg':
      case '.png':
        return 'bi bi-file-earmark-image-fill'; // Ícono para archivos de imagen
      default:
        return 'bi bi-file-earmark'; // Ícono genérico para otros archivos
    }
  }
  eliminarCarpeta(){
  this.mostrarmenu=false;
  if(confirm("Desea eliminar el archivo permanentemente?")){
    this.servicioArchivos.eliminarDelSistema(this.objetoCopiado._id).subscribe(data=>{
      this.traerArchivosdeCarpetaCompartida();
    }, error=>{console.log(error)})
   }
  }
  verPropiedades() {
    this.modalDetalles = true
    this.mostrarmenu = false
  }

  cerrarModal() {
    this.selectedImage = ''
    this.modalArchivos = ''
    this.selectedExtension = ''
    this.modalDetalles = false

 
  }
  getIDUser() {
    let stringUser = localStorage.getItem('usuario');
    let usuario: Usuario = stringUser ? JSON.parse(stringUser) : null;
    let id = usuario ? usuario._id : '0';
    return id;
  }
  getNameUser() {
    let stringUser = localStorage.getItem('usuario');
    let usuario: Usuario = stringUser ? JSON.parse(stringUser) : null;
    let name = usuario ? usuario.nombre : '0';
    return name;
  }
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent, folder: (any | null), isfolder: number) { // 0 no es nada, 1 es carpeta 2 es archivo
    event.preventDefault(); // Previene el menú de contexto por defecto del navegador
    event.stopPropagation(); // Detener la propagación del evento

    if (folder) {
      this.isCarpeta = isfolder === 1 ? true : false;
      this.objetoCopiado = folder
      console.log(this.objetoCopiado)
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210; // Ajusta la posición horizontal
      this.mostrarmenu = true; // Muestra el menú contextual de la carpeta


    } else {
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210;
      this.mostrarmenu = false;
    }
  }
}
