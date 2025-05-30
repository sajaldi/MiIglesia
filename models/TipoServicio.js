class TipoServicio {
  constructor(id, nombre, descripcion) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export default TipoServicio;