import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

class Checklist {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.diaServicioId = data.diaServicioId;
    this.fechaCreacion = data.fechaCreacion || new Date();
    this.completada = data.completada || false;
  }

  static async create(data) {
    try {
      const checklistData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        diaServicioId: data.diaServicioId || null,
        fechaCreacion: new Date(),
        completada: false
      };

      const docRef = await addDoc(collection(db, 'checklists'), checklistData);
      return new Checklist({ id: docRef.id, ...checklistData });
    } catch (error) {
      console.error('Error creating checklist:', error);
      throw error;
    }
  }

  static async getByDiaServicio(diaServicioId) {
    try {
      const q = query(
        collection(db, 'checklists'),
        where('diaServicioId', '==', diaServicioId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => new Checklist({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting checklists:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'checklists'));
      return querySnapshot.docs.map(doc => new Checklist({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all checklists:', error);
      throw error;
    }
  }

  async update(newData) {
    try {
      const checklistRef = doc(db, 'checklists', this.id);
      await updateDoc(checklistRef, newData);
      Object.assign(this, newData);
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  }

  async delete() {
    try {
      await deleteDoc(doc(db, 'checklists', this.id));
    } catch (error) {
      console.error('Error deleting checklist:', error);
      throw error;
    }
  }
}

export default Checklist;