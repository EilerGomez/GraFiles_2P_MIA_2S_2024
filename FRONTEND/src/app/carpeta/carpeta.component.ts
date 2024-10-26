import { Component, HostListener } from '@angular/core';
import { Carpeta } from '../Modelo/Carpeta';
import { CarpetasService } from '../Service/carpetas.service';
import { Usuario } from '../Modelo/Usuario';
import { data, error } from 'jquery';
import { Archivos } from '../Modelo/Archivos';
import { ArchivosService } from '../Service/archivos.service';
import { UsuariosService } from '../Service/usuarios.service';
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
  isCarpeta!: boolean // si es true es carpeta si es false es archivo
  objetoCopiado: any
  formType: 'carpeta' | 'archivo' | null = null; // Tipo de formulario a mostrar
  constructor(private servicioCarpetas: CarpetasService, private servicioArchivos: ArchivosService, private servicioUsuarios:UsuariosService) { }
  idCarpetaActual: string = '0';//es la carpeta raiz
  carpetas: Carpeta[] = [];
  archivos: Archivos[] = [];
  breadcrumb: { id: string, nombre: string }[] = [];
  ngOnInit(): void {
    this.traerCarpetaRaiz();
    this.traerCarpetaCompartida();
  }

  traerCarpetaRaiz() {
    this.servicioCarpetas.getCarpetaRaiz().subscribe(data => {
      console.log(data);
      this.idCarpetaActual = data._id;
      this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
    })
  }

  traerCarpetaCompartida() {
    this.servicioCarpetas.getCarpetaCompartida().subscribe(data => {
      console.log(data)
      this.carpetaCompartida = data;
    })
  }

  traerCarpetasDeUnaCarpeta(idC: string) {
    this.servicioCarpetas.getCarpetasDeCarpeta(this.getIDUser(), idC).subscribe(data => {
      this.carpetas = data;
      this.traerArchivosDeUnaCarpeta(idC);
    }, error => {
      console.log(error)
    })
  }

  traerArchivosDeUnaCarpeta(idC: string) {
    this.servicioArchivos.getArchivos(idC, this.getIDUser()).subscribe(data => {
      this.archivos = data
    }, error => { console.log(error) })
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
    if (this.nuevaExtension === '.png' || this.nuevaExtension === '.png') {
      this.subirArchivo();
    } else {
      this.servicioArchivos.postArchivo(this.nuevoArchivoNombre, this.nuevaExtension, this.nuevoContenido, this.idCarpetaActual,this.getIDUser()).subscribe(data => {
        this.traerArchivosDeUnaCarpeta(this.idCarpetaActual);
        this.toggleForm();
      }, error => {
        console.log(error)
        alert("No se pude agregar archivos con el mismo nombre y la misma extension");
        this.traerArchivosDeUnaCarpeta(this.idCarpetaActual)
        this.toggleForm()
      })
    }
  }


  // Método para mostrar el menú
  menuTop: number = 0;
  menuLeft: number = 0;
  mostrarmenu: boolean = false;
  mostrarmenu2: boolean = false;
  mostrarModal: boolean = false;


  // Métodos para las acciones del menú
  abrirModal() {
    if (this.isCarpeta) {
      this.nuevoNombre = this.carpetaEdit.nombre
      this.mostrarModal = true; // Muestra el modal
      this.mostrarmenu = false;
    } else {
      this.editArchivoModal = true
      this.mostrarmenu = false
    }

  }

  cerrarModal() {
    this.mostrarModal = false; // Oculta el modal
    this.nuevoNombre = ''; // Limpia el campo de texto
    this.selectedImage = ''
    this.modalArchivos = ''
    this.selectedExtension = ''
    this.modalDetalles = false
    this.editArchivoModal = false;
    this.mostrarmodalCompartirArchivo = false;
    this.busqueda = '';
    this.usuariosFiltrados = [];
    this.usuarioSeleccionado = null;
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
    if (this.isCarpeta) {
      if (confirm("Eliminar la carpeta: " + this.carpetaEdit.nombre + " ?")) {
        this.servicioCarpetas.deleteCarpeta(this.carpetaEdit._id).subscribe(data => {
          this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual)
        })
      }
    } else {
      if (confirm("Eliminar el archivo: " + this.objetoCopiado.nombre + this.objetoCopiado.extension + " ?")) {
        this.servicioArchivos.deleteArchivo(this.objetoCopiado._id).subscribe(data => {
          this.traerArchivosDeUnaCarpeta(this.idCarpetaActual)
        }, error => { console.log(error) })
      }
    }

    this.carpetaEdit = new Carpeta()
    this.mostrarmenu = false
  }
  permisoMover_Copiar: boolean = false
  copiarCarpeta() {

    this.permisoMover_Copiar = true
    this.mostrarmenu = false
    console.log('Objeto copiado:', this.objetoCopiado);
  }
  moverCarpeta() {
    if (this.isCarpeta === true) {
      this.servicioCarpetas.putMoverCarpeta(this.carpetaEdit._id, this.carpetaEdit.nombre, this.idCarpetaActual).subscribe(data => {
        this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual)
      }, error => { console.log(error) })
    } else {
      this.servicioArchivos.putMoverArchivo(this.objetoCopiado._id, this.objetoCopiado.nombre, this.idCarpetaActual, this.objetoCopiado.extension).subscribe(data => {
        this.traerArchivosDeUnaCarpeta(this.idCarpetaActual);
      }, error => { console.log(error) })
    }

    this.permisoMover_Copiar = false
  }
  pegarCarpeta() {
    if (this.isCarpeta === true) {
      this.servicioCarpetas.postCopiarCarpeta(this.carpetaEdit.nombre, this.carpetaEdit.id_usuario, this.carpetaEdit._id, this.idCarpetaActual).subscribe(data => {
        this.traerCarpetasDeUnaCarpeta(this.idCarpetaActual);
      }, error => { console.log(error) })
    } else {
      this.servicioArchivos.pegarArchivo(this.objetoCopiado._id, this.idCarpetaActual).subscribe(data => {
        this.traerArchivosDeUnaCarpeta(this.idCarpetaActual);
      }, error => { console.log(error) })
    }
    this.permisoMover_Copiar = false
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
    this.mostrarmenu2 = false;
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
      this.mostrarmenu2 = false


    } else {
      this.menuTop = event.clientY - 45; // Ajusta la posición vertical
      this.menuLeft = event.clientX - 210;
      this.mostrarmenu = false;
      this.mostrarmenu2 = true; // Muestra el segundo menú contextual si no hay carpeta
    }
  }




  selectedFile: File | null = null;
  selectedImage: string | null = null; // Almacena la imagen seleccionada

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  subirArchivo() {
    if (this.selectedFile && this.idCarpetaActual && this.nuevoArchivoNombre) {
      const formData = new FormData();
      formData.append('imagen', this.selectedFile, this.selectedFile.name);
      formData.append('idFM', this.idCarpetaActual);
      formData.append('idU', this.getIDUser());
      formData.append('nombreArchivo', this.nuevoArchivoNombre);
      formData.append('extensionArchivo', this.nuevaExtension);
      this.servicioArchivos.subirArchivo(formData).subscribe(
        (response) => {
          console.log('Archivo subido con éxito', response);
          this.toggleForm();
          this.traerArchivosDeUnaCarpeta(this.idCarpetaActual); // Actualiza la lista de archivos después de subir
        },
        (error) => {
          console.error('Error al subir archivo', error);
        }
      );
    }
  }



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

  actualizarArchivo() {
    this.editArchivoModal = false
    if (this.objetoCopiado.extension === '.png' || this.objetoCopiado.extension === '.png') {
      const formData = new FormData();
      if (this.selectedFile) {
        formData.append('imagen', this.selectedFile, this.selectedFile.name);
      }
      formData.append('extension', this.objetoCopiado.extension);
      formData.append('nombre', this.objetoCopiado.nombre);
      formData.append('idArchivo', this.objetoCopiado._id);
      console.log(formData)
      this.servicioArchivos.actualizarArchivoImagen(formData).subscribe(data => {
        this.traerArchivosDeUnaCarpeta(this.idCarpetaActual)
        alert("Archivo actualizado correctamente")
        this.selectedFile = null
      }, error => { console.log(error); this.traerArchivosDeUnaCarpeta(this.idCarpetaActual) })
    } else {
      this.servicioArchivos.putEditarArchivo(this.objetoCopiado.extension, this.objetoCopiado.nombre, this.objetoCopiado.contenido, this.objetoCopiado._id, this.idCarpetaActual).subscribe(data => {
        this.traerArchivosDeUnaCarpeta(this.idCarpetaActual);
        alert("Archivo actualizado correctamente")
      }, error => {
        console.log(error)
      })
    }
  }

  carpetaCompartida!: Carpeta


  // para compartir un archivo
  mostrarmodalCompartirArchivo = false;
  usuarios: Usuario[] = []
  usuariosFiltrados:Usuario[]= [];
  busqueda = '';
  usuarioSeleccionado: any = null;
  // Filtra los usuarios por nombre o username
  filtrarUsuarios(): void {
    const termino = this.busqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (usuario) =>
        usuario.nombre.toLowerCase().includes(termino) ||
        usuario.username.toLowerCase().includes(termino)
    );
  }

  // Selecciona un usuario de la lista
  seleccionarUsuario(usuario: any): void {
    this.usuarioSeleccionado = usuario;
  }
  // Método para compartir el archivo
  compartirArchivo(): void {
    console.log(this.carpetaCompartida)
    if (this.usuarioSeleccionado) {
      this.servicioArchivos.postCompartirArchivo(this.carpetaCompartida._id,this.usuarioSeleccionado._id,this.getNameUser(),this.objetoCopiado._id
    ).subscribe(data=>{
      alert("Archivo compartido correctamente")
    }, error=>{console.log(error)})
      this.cerrarModal(); // Cierra el modal después de compartir
    }
  }
  mostrarModalCompartir(){
    this.mostrarmenu=false
    this.mostrarmodalCompartirArchivo=true
    this.servicioUsuarios.getUsuarios().subscribe(data=>{
      this.usuarios=data;
    })
  }
}
