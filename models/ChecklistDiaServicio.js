import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

class ChecklistDiaServicio {
  constructor(data) {
    this.id = data.id;
    this.diaServicioId = data.diaServicioId;
    this.checklistId = data.checklistId;
    this.descripcion = data.descripcion;
    this.completado = data.completado || false;
    this.observacion = data.observacion || '';
    this.fechaCreacion = data.fechaCreacion || new Date();
  }

  static async createFromChecklist(diaServicioId, checklistId, items) {
    try {
      const checklistItems = items.map(item => ({
        diaServicioId,
        checklistId,
        descripcion: item.descripcion,
        completado: false,
        observacion: '',
        fechaCreacion: new Date()
      }));

      const createdItems = await Promise.all(
        checklistItems.map(item => addDoc(collection(db, 'checklistDiaServicio'), item))
      );

      return createdItems.map((docRef, index) => 
        new ChecklistDiaServicio({ id: docRef.id, ...checklistItems[index] })
      );
    } catch (error) {
      console.error('Error creating checklist dia servicio:', error);
      throw error;
    }
  }

  static async getByDiaServicio(diaServicioId) {
    try {
      const q = query(
        collection(db, 'checklistDiaServicio'),
        where('diaServicioId', '==', diaServicioId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => new ChecklistDiaServicio({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting checklist items:', error);
      throw error;
    }
  }

  async update(newData) {
    try {
      const itemRef = doc(db, 'checklistDiaServicio', this.id);
      await updateDoc(itemRef, newData);
      Object.assign(this, newData);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  }
}

export default ChecklistDiaServicio;