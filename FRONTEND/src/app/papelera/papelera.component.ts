import { Component,HostListener } from '@angular/core';
import { Carpeta } from '../Modelo/Carpeta';
import { CarpetasService } from '../Service/carpetas.service';
import { ArchivosService } from '../Service/archivos.service';
import { UsuariosService } from '../Service/usuarios.service';
import { Usuario } from '../Modelo/Usuario';
import { Archivos } from '../Modelo/Archivos';

@Component({
  selector: 'app-papelera',
  template: `
    <div *ngFor="let folder of carpetas">
      <button (click)="navegarACarpeta(folder)">{{ folder.nombre }}</button>
    </div>
  `,
  templateUrl: './papelera.component.html',
  styleUrls: ['./papelera.component.css']
})
export class PapeleraComponent {
  carpetaEdit: Carpeta = new Carpeta();
  isCarpeta!: boolean // si es true es carpeta si es false es archivo
  objetoCopiado: any
  constructor(private servicioCarpetas: CarpetasService, private servicioArchivos: ArchivosService, private servicioUsuarios:UsuariosService) { }
  idCarpetaActual: string = '0';//es la carpeta raiz
  carpetas: Carpeta[] = [];
  archivos: Archivos[] = [];
  breadcrumb: { id: string, nombre: string }[] = [];
  ngOnInit(): void {
    this.traerCarpetaRaiz();
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
  traerCarpetaRaiz() {
    this.servicioCarpetas.getCarpetaRaiz().subscribe(data => {
      console.log(data);
      this.idCarpetaActual = data._id;
      this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
    })
  }
  traerCarpetasDeUnaCarpeta(idC: string) {
    this.servicioCarpetas.getCarpetasDeCarpetaEliminadas(this.getIDUser(), idC).subscribe(data => {
      this.carpetas = data;
      this.traerArchivosDeUnaCarpeta(idC);
    }, error => {
      console.log(error)
    })
  }
  traerArchivosDeUnaCarpeta(idC: string) {
    this.servicioArchivos.getArchivosEliminados(idC).subscribe(data => {
      console.log(data)
      this.archivos = data
    }, error => { console.log(error) })
  }
  navegarACarpeta(folder: Carpeta) {
    this.mostrarmenu = false
    this.breadcrumb.push({ id: folder._id, nombre: folder.nombre });
    // Aquí deberías cargar las subcarpetas de la carpeta seleccionada
    console.log('navegando a carpeta con id: ' + folder._id)
    this.idCarpetaActual = folder._id;
    this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
  }

  navigateTo(id: string) {
    this.mostrarmenu = false
    if (id === '0') {
      this.traerCarpetaRaiz();
      this.breadcrumb = this.breadcrumb.slice(0, 0);
    } else {
      // Encuentra el índice de la carpeta seleccionada en el breadcrumb
      const index = this.breadcrumb.findIndex(folder => folder.id === id);
      console.log('navegando a carpeta con id: ' + id)
      if (index > -1) {
        // Mantiene solo las carpetas hasta la seleccionada
        this.breadcrumb = this.breadcrumb.slice(0, index + 1);
        // Cargar las carpetas correspondientes a la carpeta seleccionada
        this.loadCarpetasById(id);
      }
    }

  }

  loadCarpetasById(id: string) {
    // Cambia el ID de la carpeta actual y carga las carpetas correspondientes
    this.idCarpetaActual = id;
    this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
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



  

  
  // Método para mostrar el menú
  menuTop: number = 0;
  menuLeft: number = 0;
  mostrarmenu: boolean = false;


  // Métodos para las acciones del menú
  abrirModal() {
    if (this.isCarpeta) {
      this.mostrarmenu = false;
    } else {
      this.editArchivoModal = true
      this.mostrarmenu = false
    }

  }

  cerrarModal() {
    this.selectedImage = ''
    this.modalArchivos = ''
    this.selectedExtension = ''
    this.modalDetalles = false
    this.editArchivoModal = false;
  }


  eliminarCarpeta() {
    if (this.isCarpeta) {
      if (confirm("Eliminar la carpeta: " + this.carpetaEdit.nombre + " ?")) {
        this.servicioCarpetas.eliminarDelSistema(this.carpetaEdit._id).subscribe(data => {
          this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual)
        })
      }
    } else {
      if (confirm("Eliminar el archivo: " + this.objetoCopiado.nombre + this.objetoCopiado.extension + " ?")) {
        this.servicioArchivos.eliminarDelSistema(this.objetoCopiado._id).subscribe(data => {
          this.traerArchivosDeUnaCarpeta(this.idCarpetaActual)
        }, error => { console.log(error) })
      }
    }

    this.carpetaEdit = new Carpeta()
    this.mostrarmenu = false
  }



  verPropiedades() {
    this.modalDetalles = true
    this.mostrarmenu = false
  }


  mostrarMenu(carpeta: Carpeta, event: MouseEvent) {
    this.carpetaEdit = carpeta
    event.preventDefault(); // Prevenir acción predeterminada del botón
    event.stopPropagation(); // Detener la propagación del evento
    this.menuTop = event.clientY - 45; // Posición vertical
    this.menuLeft = event.clientX - 210; // Posición horizontal
    this.mostrarmenu = true; // Muestra el menú
  }

  @HostListener('document:click', ['$event'])
  cerrarMenu(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    const clickedInsideMenu = targetElement.closest('.menu-contextual') !== null;

    if (!clickedInsideMenu) {
      this.mostrarmenu = false; // Oculta el menú
    }
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent, folder: (any | null), isfolder: number) { // 0 no es nada, 1 es carpeta 2 es archivo
    event.preventDefault(); // Previene el menú de contexto por defecto del navegador
    event.stopPropagation(); // Detener la propagación del evento

    if (folder) {
      this.isCarpeta = isfolder === 1 ? true : false;
      this.objetoCopiado = folder
      console.log(this.objetoCopiado)
      this.carpetaEdit = folder; // Asigna la carpeta editada
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210; // Ajusta la posición horizontal
      this.mostrarmenu = true; // Muestra el menú contextual de la carpeta


    } else {
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210;
      this.mostrarmenu = false;
    }
  }




  selectedImage: string | null = null; // Almacena la imagen seleccionada

  mostrarArchivo(archivo: Archivos) {
    if (archivo.extension === '.html' || archivo.extension === '.txt') {
      this.modalArchivos = archivo.contenido;
      this.selectedExtension = archivo.extension
    } else {
      this.selectedImage = `http://localhost:3010/archivos/imagen/${archivo.contenido}`; // Asegúrate de que esto apunte correctamente a tu servidor
    }
  }


  modalArchivos: string = '';
  selectedExtension: string = ''
  modalDetalles: boolean = false

  editArchivoModal: boolean = false;



  carpetaCompartida!: Carpeta


  // para compartir un archivo
  usuarios: Usuario[] = []







}
