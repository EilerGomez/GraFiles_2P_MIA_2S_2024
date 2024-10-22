export class Venta {
    codigo!: number;
    usuario!: number;
    n_usuario!: string;
    sucursal!: number;
    n_sucursal!: string;
    cliente!: number;
    n_cliente!: string;
    nit_cliente!: string;
    total_sin_descuento!: number;
    total_con_descuento!: number;
    fecha!: string;
    caja!: number;
    puntos_descuento!:number
  
    // Constructor
    constructor(
      codigo: number,
      usuario: number,
      n_usuario: string,
      sucursal: number,
      n_sucursal: string,
      cliente: number,
      n_cliente: string,
      nit_cliente: string,
      total_sin_descuento: number,
      total_con_descuento: number,
      fecha: string,
      caja: number,
      puntos_descuento:number
    ) {
      this.codigo = codigo;
      this.usuario = usuario;
      this.n_usuario = n_usuario;
      this.sucursal = sucursal;
      this.n_sucursal = n_sucursal;
      this.cliente = cliente;
      this.n_cliente = n_cliente;
      this.nit_cliente = nit_cliente;
      this.total_sin_descuento = total_sin_descuento;
      this.total_con_descuento = total_con_descuento;
      this.fecha = fecha;
      this.caja = caja;
      this.puntos_descuento=puntos_descuento;
    }
  
    // Getters
    getCodigo(): number {
      return this.codigo;
    }
  
    getUsuario(): number {
      return this.usuario;
    }
  
    getN_usuario(): string {
      return this.n_usuario;
    }
  
    getSucursal(): number {
      return this.sucursal;
    }
  
    getN_sucursal(): string {
      return this.n_sucursal;
    }
  
    getCliente(): number {
      return this.cliente;
    }
  
    getN_cliente(): string {
      return this.n_cliente;
    }
  
    getNit_cliente(): string {
      return this.nit_cliente;
    }
  
    getTotal_sin_descuento(): number {
      return this.total_sin_descuento;
    }
  
    getTotal_con_descuento(): number {
      return this.total_con_descuento;
    }
  
    getFecha(): string {
      return this.fecha;
    }
  
    getCaja(): number {
      return this.caja;
    }
  
    // Setters
    setCodigo(codigo: number): void {
      this.codigo = codigo;
    }
  
    setUsuario(usuario: number): void {
      this.usuario = usuario;
    }
  
    setN_usuario(n_usuario: string): void {
      this.n_usuario = n_usuario;
    }
  
    setSucursal(sucursal: number): void {
      this.sucursal = sucursal;
    }
  
    setN_sucursal(n_sucursal: string): void {
      this.n_sucursal = n_sucursal;
    }
  
    setCliente(cliente: number): void {
      this.cliente = cliente;
    }
  
    setN_cliente(n_cliente: string): void {
      this.n_cliente = n_cliente;
    }
  
    setNit_cliente(nit_cliente: string): void {
      this.nit_cliente = nit_cliente;
    }
  
    setTotal_sin_descuento(total_sin_descuento: number): void {
      this.total_sin_descuento = total_sin_descuento;
    }
  
    setTotal_con_descuento(total_con_descuento: number): void {
      this.total_con_descuento = total_con_descuento;
    }
  
    setFecha(fecha: string): void {
      this.fecha = fecha;
    }
  
    setCaja(caja: number): void {
      this.caja = caja;
    }
  }
  