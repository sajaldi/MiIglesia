class DiaServicio {
  constructor(id, servicioId, dia, tipo, hora) {
    this.id = id;
    this.servicioId = servicioId;
    this.dia = dia;          // 'Lunes', 'Martes', etc.
    this.tipo = tipo;        // 'Culto de Doctrina', 'Culto de Familia', etc.
    this.hora = hora;        // '19:00'
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export default DiaServicio;