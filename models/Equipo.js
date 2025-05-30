// Modelo de Equipo
const EquipoModel = {
  id: 'string',          // ID único del equipo (generado por Firestore)
  nombre: 'string',      // Nombre del equipo
  color: 'string',       // Color del equipo (formato hex, ej: '#70d7c7')
  photoUri: 'string',    // URI de la foto del equipo (opcional)
  miembros: [],         // Array de IDs de miembros
  createdAt: 'date',    // Fecha de creación
  updatedAt: 'date'     // Fecha de última actualización
};

export default EquipoModel;