import { Component, HostListener } from '@angular/core';
import { Carpeta } from '../Modelo/Carpeta';
import { CarpetasService } from '../Service/carpetas.service';
import { Usuario } from '../Modelo/Usuario';
import { data, error } from 'jquery';
@Component({
  selector: 'app-carpeta',
  template: `
    <div *ngFor="let folder of carpetas">
      <button (click)="navegarACarpeta(folder)">{{ folder.nombre }}</button>
    </div>
  `,
  templateUrl: './carpeta.component.html',
  styleUrls: ['./carpeta.component.css']
})
export class CarpetaComponent {
  nuevoNombre: string = ''; // Variable para el nombre de la carpeta
  nuevoArchivoNombre: string = ''; // Variable para el nombre del archivo
  nuevaExtension: string = ''; // Variable para la extensión del archivo
  nuevoContenido: string = ''; // Variable para el contenido del archivo
  showForm: boolean = false; // Controla la visibilidad del formulario
  carpetaEdit: Carpeta = new Carpeta();
  carpetaAuxiliar: Carpeta = new Carpeta();

  formType: 'carpeta' | 'archivo' | null = null; // Tipo de formulario a mostrar
  constructor(private servicioCarpetas: CarpetasService) { }
  idCarpetaActual: string = '0';//es la carpeta raiz
  carpetas: Carpeta[] = [];

  breadcrumb: { id: string, nombre: string }[] = [];
  ngOnInit(): void {
    this.traerCarpetaRaiz();
  }

  traerCarpetaRaiz() {
    this.servicioCarpetas.getCarpetaRaiz().subscribe(data => {
      console.log(data);
      this.idCarpetaActual = data._id;
      this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
    })
  }

  traerCarpetasDeUnaCarpeta(idC: string) {

    this.servicioCarpetas.getCarpetasDeCarpeta(this.getIDUser(), idC).subscribe(data => {
      this.carpetas = data;
      console.log(data);
    }, error => {
      console.log(error)
    })


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

  toggleForm() {
    this.showForm = !this.showForm; // Alterna la visibilidad del formulario
    this.formType = null; // Resetea el tipo de formulario
    this.nuevoNombre = '';
    this.nuevoArchivoNombre = '';
    this.nuevaExtension = '';
    this.nuevoContenido = '';
  }
  setFormType(type: 'carpeta' | 'archivo') {
    this.formType = type; // Establece el tipo de formulario a mostrar
    this.nuevoNombre = ''; // Limpia el nombre de la carpeta
    this.nuevoArchivoNombre = ''; // Limpia el nombre del archivo
    this.nuevaExtension = ''; // Limpia la extensión
    this.nuevoContenido = ''; // Limpia el contenido del archivo
  }

  agregarCarpeta() {
    console.log(this.getIDUser() + ", " + this.idCarpetaActual + ", " + this.nuevoNombre)
    this.servicioCarpetas.postCarpeta(this.nuevoNombre, this.getIDUser(), this.idCarpetaActual).subscribe(data => {
      console.log(data);
      this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
      this.toggleForm();
    }, error => {
      console.log(error)
      alert("No se puede agregar carpetas con el mismo nombre");
      this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
      this.toggleForm();
    })


  }

  agregarArchivo() {

  }


  // Método para mostrar el menú
  menuTop: number = 0;
  menuLeft: number = 0;
  mostrarmenu: boolean = false;
  mostrarmenu2: boolean = false;
  mostrarModal: boolean = false;


  // Métodos para las acciones del menú
  abrirModal() {
    this.nuevoNombre = this.carpetaEdit.nombre
    this.mostrarModal = true; // Muestra el modal
    this.mostrarmenu = false;
  }

  cerrarModal() {
    this.mostrarModal = false; // Oculta el modal
    this.nuevoNombre = ''; // Limpia el campo de texto
  }
  actualizarNombre() {
    this.servicioCarpetas.putNombreCarpeta(this.carpetaEdit._id, this.nuevoNombre, this.idCarpetaActual).subscribe(data => {
      console.log(data)
      this.mostrarModal = false
      this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
    }, error => {
      alert("No se permiten nombres de carpetas repetidas")
      this.mostrarModal = false
    })
    this.carpetaEdit = new Carpeta()
  }

  eliminarCarpeta() {
    if (confirm("Eliminar la carpeta: " + this.carpetaEdit.nombre + " ?")) {
      this.servicioCarpetas.deleteCarpeta(this.carpetaEdit._id).subscribe(data => {
        this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual)
      })
    }
    this.carpetaEdit = new Carpeta()
    this.mostrarmenu = false
  }
  permisoMover_Copiar: boolean = false
  copiarCarpeta() {
    this.permisoMover_Copiar = true
    this.mostrarmenu = false
    console.log('Carpeta copiada:', this.carpetaEdit);
  }
  moverCarpeta() {

  }
  pegarCarpeta(){
    
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
    this.mostrarmenu2 = false;
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent, folder: (Carpeta | null)) {
    event.preventDefault(); // Previene el menú de contexto por defecto del navegador
    event.stopPropagation(); // Detener la propagación del evento

    if (folder) {
      this.carpetaEdit = folder; // Asigna la carpeta editada
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210; // Ajusta la posición horizontal
      this.mostrarmenu = true; // Muestra el menú contextual de la carpeta
      this.mostrarmenu2=false
    } else {
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210;
      this.mostrarmenu=false;
      this.mostrarmenu2 = true; // Muestra el segundo menú contextual si no hay carpeta
    }
  }






}
