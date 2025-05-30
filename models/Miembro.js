class Miembro {
  constructor({
    id = null,
    nombre = '',
    apellido = '',
    telefono = '',
    email = '',
    direccion = '',
    fechaNacimiento = null,
    fechaBautismo = null,
    cargo = null,
    equipos = [],
    photoUri = null,
    // Family relationships
    padres = [],
    hermanos = [],
    conyuge = null,
    hijos = [],
    // Additional fields
    genero = '',
    activo = true,
    fechaRegistro = new Date(),
    userId = null // Add this field
  } = {}) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.email = email;
    this.direccion = direccion;
    this.fechaNacimiento = fechaNacimiento;
    this.fechaBautismo = fechaBautismo;
    this.cargo = cargo;
    this.equipos = equipos;
    this.photoUri = photoUri;
    this.padres = padres;
    this.hermanos = hermanos;
    this.conyuge = conyuge;
    this.hijos = hijos;
    this.genero = genero;
    this.activo = activo;
    this.fechaRegistro = fechaRegistro;
    this.userId = userId; // Initialize the userId
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Miembro({
      id: doc.id,
      ...data,
      fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.toDate() : null,
      fechaBautismo: data.fechaBautismo ? data.fechaBautismo.toDate() : null,
      fechaRegistro: data.fechaRegistro ? data.fechaRegistro.toDate() : new Date()
    });
  }

  toFirestore() {
    const miembroData = { ...this };
    delete miembroData.id;
    return miembroData;
  }
}

export default Miembro;