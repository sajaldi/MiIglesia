import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const createAdminUser = async () => {
  try {
    // First check if admin already exists
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        'admin@iglesia.com',
        'admin123'
      );
      console.log('Admin user already exists');
      return userCredential.user;
    } catch (signInError) {
      // If login fails, create new admin
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'admin@iglesia.com',
        'admin123'
      );

      // Add admin user data to Firestore
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        email: 'admin@iglesia.com',
        rol: 'admin',
        nombre: 'Administrador',
        fechaCreacion: new Date(),
      });

      console.log('Admin user created successfully');
      return userCredential.user;
    }
  } catch (error) {
    console.error('Error managing admin user:', error);
    throw error;
  }
};