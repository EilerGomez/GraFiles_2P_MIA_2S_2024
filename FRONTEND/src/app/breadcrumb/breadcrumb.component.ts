import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav>
      <!-- Enlace fijo al "Inicio" -->
      <a (click)="navigateTo('0')">Inicio</a>
      <ng-container *ngFor="let folder of breadcrumb; let i = index">
        <ng-container *ngIf="i >= 0"> / </ng-container>
        <a (click)="navigateTo(folder.id)">{{ folder.nombre }}</a>
      </ng-container>
    </nav>
  `,
  styles: [`
    nav {
      font-size: 14px;
      color: #007bff;
    }
    nav a {
      cursor: pointer;
      text-decoration: none;
    }
  `]
})
export class BreadcrumbComponent {
  @Input() breadcrumb: { id: string, nombre: string }[] = [];
  @Output() navigate: EventEmitter<string> = new EventEmitter<string>();

  navigateTo(id: string) {
    this.navigate.emit(id); // Emitimos el ID de la carpeta seleccionada
  }
}
