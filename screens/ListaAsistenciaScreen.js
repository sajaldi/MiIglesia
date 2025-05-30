import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const ListaAsistenciaScreen = ({ route }) => {
  // Add validation for route params
  if (!route.params?.diaServicio) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: No se encontró información del día de servicio</Text>
      </View>
    );
  }

  const { diaServicio } = route.params;
  const [miembrosEquipo, setMiembrosEquipo] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  const [loading, setLoading] = useState(true); // Changed to true initially
  const [listaGenerada, setListaGenerada] = useState(false);

  const cargarMiembrosEquipo = async () => {
    try {
      setLoading(true); // Set loading at the start
      if (!diaServicio?.servicioId) {
        throw new Error('ID de servicio no encontrado');
      }

      console.log('DiaServicio recibido:', diaServicio);
      
      const servicioRef = doc(db, 'servicios', diaServicio.servicioId);
      const servicioDoc = await getDoc(servicioRef);
      
      if (servicioDoc.exists()) {
        const servicio = servicioDoc.data();
        const equipoId = servicio.equipoId;
        console.log('EquipoID:', equipoId);
  
        // Obtener el equipo directamente
        const equipoRef = doc(db, 'equipos', equipoId);
        const equipoDoc = await getDoc(equipoRef);
        
        if (equipoDoc.exists()) {
          const equipoData = equipoDoc.data();
          console.log('Equipo data:', equipoData);
          
          // Usar los miembros directamente del array en el equipo
          const miembrosIds = equipoData.miembros || [];
          console.log('MiembrosIds:', miembrosIds);
  
          const miembros = [];
          for (const miembroId of miembrosIds) {
            const miembroRef = doc(db, 'miembros', miembroId);
            const miembroDoc = await getDoc(miembroRef);
            
            if (miembroDoc.exists()) {
              miembros.push({
                id: miembroDoc.id,
                ...miembroDoc.data()
              });
            }
          }
          
          console.log('Miembros procesados:', miembros.length);
          setMiembrosEquipo(miembros);
        } else {
          console.log('No se encontró el equipo');
          Alert.alert('Error', 'No se encontró el equipo especificado');
        }
      } else {
        console.log('No se encontró el servicio');
        Alert.alert('Error', 'No se encontró el servicio especificado');
      }
    } catch (error) {
      console.error('Error al cargar miembros:', error);
      Alert.alert('Error', 'No se pudieron cargar los miembros del equipo');
    }
    // Remove setLoading(false) from here - we'll handle it after both loads are complete
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await cargarMiembrosEquipo();
      await cargarAsistencia();
      setLoading(false);
    };
    cargarDatos();
  }, []);

  const cargarAsistencia = async () => {
    try {
      if (!diaServicio?.id) {
        throw new Error('ID de día de servicio no encontrado');
      }

      const asistenciaSnapshot = await getDocs(query(
        collection(db, 'asistencia'),
        where('diaServicioId', '==', diaServicio.id)
      ));
  
      const asistenciaData = {};
      asistenciaSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.miembro && data.miembro.id) {
          asistenciaData[data.miembro.id] = {
            id: doc.id,
            ...data
          };
        }
      });
      setAsistencia(asistenciaData);
      setListaGenerada(asistenciaSnapshot.docs.length > 0);
    } catch (error) {
      console.error('Error al cargar asistencia:', error);
    }
    // Remove setLoading(false) from here as well
  };
  
  const toggleAsistencia = async (miembroId) => {
    try {
      if (asistencia[miembroId]) {
        await deleteDoc(doc(db, 'asistencia', asistencia[miembroId].id));
        const newAsistencia = { ...asistencia };
        delete newAsistencia[miembroId];
        setAsistencia(newAsistencia);
      } else {
        const asistenciaData = {
          miembro: {
            id: miembroId,
            asistencia: true
          },
          diaServicioId: diaServicio.id,
          fecha: new Date()
        };
        
        const docRef = await addDoc(collection(db, 'asistencia'), asistenciaData);
        
        setAsistencia(prev => ({
          ...prev,
          [miembroId]: {
            id: docRef.id,
            ...asistenciaData
          }
        }));
      }
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      Alert.alert('Error', 'No se pudo actualizar la asistencia');
    }
  };

  const renderMiembro = (miembro) => (
    <View key={miembro.id} style={styles.miembroItem}>
      <View style={styles.miembroInfo}>
        <Text style={styles.miembroNombre}>{miembro.nombre}</Text>
        <Text style={styles.miembroRol}>{miembro.rol || 'Miembro'}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.asistenciaButton,
          asistencia[miembro.id]?.miembro?.asistencia ? styles.asistenciaPresente : styles.asistenciaAusente
        ]}
        onPress={() => toggleAsistencia(miembro.id)}
      >
        <Ionicons 
          name={asistencia[miembro.id]?.miembro?.asistencia ? "checkmark-circle" : "checkmark-circle-outline"} 
          size={24} 
          color={asistencia[miembro.id]?.miembro?.asistencia ? "#fff" : "#666"} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Asistencia</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando lista...</Text>
        </View>
      ) : (
        <>
          {!listaGenerada && (
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={cargarLista}
              disabled={loading}
            >
              <View style={styles.generateButtonContent}>
                <Ionicons 
                  name="refresh-circle-outline" 
                  size={24} 
                  color="white" 
                  style={styles.generateButtonIcon}
                />
                <Text style={styles.generateButtonText}>
                  {loading ? 'Generando...' : 'Generar Lista de Asistencia'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <ScrollView style={styles.scrollContainer}>
            {miembrosEquipo.map(renderMiembro)}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  miembroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  miembroInfo: {
    flex: 1,
  },
  miembroNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  miembroRol: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  asistenciaButton: {
    padding: 10,
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  asistenciaPresente: {
    backgroundColor: '#2ecc71',
  },
  asistenciaAusente: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  generateButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonIcon: {
    marginRight: 10,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default ListaAsistenciaScreen;

  const cargarLista = async () => {
    try {
      setLoading(true);
      await cargarMiembrosEquipo();
      await cargarAsistencia();
      setListaGenerada(true);
      Alert.alert('Éxito', 'Lista de asistencia generada correctamente');
    } catch (error) {
      console.error('Error al generar lista:', error);
      Alert.alert('Error', 'No se pudo generar la lista de asistencia');
    } finally {
      setLoading(false);
    }
  };