import { db, storage } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class Observacion {
  constructor(data) {
    this.id = data.id;
    this.diaServicioId = data.diaServicioId;
    this.descripcion = data.descripcion;
    this.fotos = data.fotos || [];
    this.miembroId = data.miembroId;
    this.miembroNombre = data.miembroNombre;
    this.fechaCreacion = data.fechaCreacion || new Date();
  }

  static async create(data) {
    try {
      const observacionData = {
        diaServicioId: data.diaServicioId,
        descripcion: data.descripcion,
        fotos: data.fotos.map(foto => ({
          data: foto.data,  // base64 data
          timestamp: Date.now()
        })),
        miembroId: data.miembroId,
        miembroNombre: data.miembroNombre,
        fechaCreacion: new Date()
      };

      const docRef = await addDoc(collection(db, 'observaciones'), observacionData);
      return new Observacion({ id: docRef.id, ...observacionData });
    } catch (error) {
      console.error('Error creating observacion:', error);
      throw error;
    }
  }

  static async getByDiaServicio(diaServicioId) {
    try {
      const q = query(
        collection(db, 'observaciones'),
        where('diaServicioId', '==', diaServicioId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => new Observacion({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting observaciones:', error);
      throw error;
    }
  }

  async update(newData) {
    try {
      const observacionRef = doc(db, 'observaciones', this.id);
      
      // Handle new photos
      if (newData.fotos && newData.fotos.length > 0) {
        const newUrls = await Promise.all(
          newData.fotos.map(async (foto) => {
            const fotoRef = ref(storage, `observaciones/${Date.now()}-${foto.name}`);
            await uploadBytes(fotoRef, foto);
            return getDownloadURL(fotoRef);
          })
        );
        newData.fotos = [...this.fotos, ...newUrls];
      }

      await updateDoc(observacionRef, newData);
      Object.assign(this, newData);
    } catch (error) {
      console.error('Error updating observacion:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Delete photos from storage
      await Promise.all(
        this.fotos.map(async (fotoUrl) => {
          const fotoRef = ref(storage, fotoUrl);
          try {
            await deleteObject(fotoRef);
          } catch (error) {
            console.warn('Error deleting photo:', error);
          }
        })
      );

      // Delete document
      await deleteDoc(doc(db, 'observaciones', this.id));
    } catch (error) {
      console.error('Error deleting observacion:', error);
      throw error;
    }
  }

  async deleteFoto(fotoUrl) {
    try {
      const fotoRef = ref(storage, fotoUrl);
      await deleteObject(fotoRef);
      
      const updatedFotos = this.fotos.filter(url => url !== fotoUrl);
      await this.update({ fotos: updatedFotos });
    } catch (error) {
      console.error('Error deleting foto:', error);
      throw error;
    }
  }
}

export default Observacion;