import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Miembro from '../models/Miembro';

const AuthContext = createContext({
  user: null,
  loading: true,
  miembro: null,
  setUser: () => {}
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [miembro, setMiembro] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMiembroData = async (email) => {
    try {
      const miembrosRef = collection(db, 'miembros');
      const q = query(miembrosRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const miembroDoc = querySnapshot.docs[0];
        const miembroData = Miembro.fromFirestore(miembroDoc);
        setMiembro(miembroData);
        return miembroData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching miembro:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      
      if (currentUser?.email) {
        await fetchMiembroData(currentUser.email);
      } else {
        setMiembro(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    miembro,
    loading,
    setUser
  };

  console.log('AuthProvider value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}