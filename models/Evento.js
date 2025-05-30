import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

class Evento {
  constructor(data = {}) {
    this.id = data.id || '';
    this.titulo = data.titulo || '';
    this.descripcion = data.descripcion || '';
    this.fecha = data.fecha || null;
    this.horaInicio = data.horaInicio || '';
    this.horaFin = data.horaFin || '';
    this.tipo = data.tipo || 'general';
    this.servicioId = data.servicioId || null;
    this.equipoId = data.equipoId || null;
    this.estado = data.estado || 'activo';
  }

  static async crear(eventoData) {
    try {
      const docRef = await addDoc(collection(db, 'eventos'), {
        ...eventoData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  static async obtenerPorFecha(fecha) {
    try {
      const inicioDelDia = new Date(fecha);
      inicioDelDia.setHours(0, 0, 0, 0);
      
      const finDelDia = new Date(fecha);
      finDelDia.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'eventos'),
        where('fecha', '>=', inicioDelDia),
        where('fecha', '<=', finDelDia)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  static async actualizar(id, datos) {
    try {
      const eventoRef = doc(db, 'eventos', id);
      await updateDoc(eventoRef, {
        ...datos,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  static async eliminar(id) {
    try {
      await deleteDoc(doc(db, 'eventos', id));
      return true;
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const docRef = doc(db, 'eventos', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener evento:', error);
      throw error;
    }
  }
}

export default Evento;