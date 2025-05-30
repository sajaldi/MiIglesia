import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

class ChecklistItem {
  constructor(data) {
    this.id = data.id;
    this.checklistId = data.checklistId;
    this.descripcion = data.descripcion;
    this.completado = data.completado || false;
    this.responsable = data.responsable || null;
    this.fechaCompletado = data.fechaCompletado || null;
    this.orden = data.orden || 0;
  }

  static async create(data) {
    try {
      const itemData = {
        checklistId: data.checklistId,
        descripcion: data.descripcion,
        completado: false,
        responsable: data.responsable || null,
        fechaCompletado: null,
        orden: data.orden || 0
      };

      const docRef = await addDoc(collection(db, 'checklistItems'), itemData);
      return new ChecklistItem({ id: docRef.id, ...itemData });
    } catch (error) {
      console.error('Error creating checklist item:', error);
      throw error;
    }
  }

  static async getByChecklist(checklistId) {
    try {
      const q = query(
        collection(db, 'checklistItems'),
        where('checklistId', '==', checklistId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => new ChecklistItem({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.orden - b.orden);
    } catch (error) {
      console.error('Error getting checklist items:', error);
      throw error;
    }
  }

  async toggleCompletado() {
    try {
      const completado = !this.completado;
      const fechaCompletado = completado ? new Date() : null;
      
      await this.update({
        completado,
        fechaCompletado
      });
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      throw error;
    }
  }

  async update(newData) {
    try {
      const itemRef = doc(db, 'checklistItems', this.id);
      await updateDoc(itemRef, newData);
      Object.assign(this, newData);
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  }

  async delete() {
    try {
      await deleteDoc(doc(db, 'checklistItems', this.id));
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  }
}

export default ChecklistItem;