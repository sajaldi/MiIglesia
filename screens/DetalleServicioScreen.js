import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';  // Add this import
import { doc, updateDoc } from 'firebase/firestore';

const DetalleServicioScreen = ({ route, navigation }) => {
  const servicio = route.params.servicio;
  const [diasServicio, setDiasServicio] = useState([]);

  // Add edit button in the header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => navigation.navigate('EditarServicio', { servicio })}
        >
          <Ionicons name="pencil" size={24} color="#3498db" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, servicio]);

  useEffect(() => {
    console.log('DetalleServicioScreen mounted');
    console.log('Current navigation state:', navigation.getState());
    console.log('Parent navigation:', navigation.getParent());
    console.log('Root navigation:', navigation.getParent('root'));
    cargarDiasServicio();
  }, []);

  const cargarDiasServicio = async () => {
    try {
      const q = query(
        collection(db, 'diasServicio'),
        where('servicioId', '==', servicio.id)
      );
      const querySnapshot = await getDocs(q);
      const dias = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Loaded diasServicio:', dias);
      setDiasServicio(dias);
    } catch (error) {
      console.error('Error al cargar días de servicio:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  const getDayOfWeek = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(date.seconds * 1000);
    return days[d.getDay()];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{servicio.nombre}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Tipo de Servicio:</Text>
          <Text style={styles.value}>{servicio.tipoServicio}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Día de Servicio:</Text>
          <Text style={styles.value}>{getDayOfWeek(servicio.fechaInicio)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Descripción:</Text>
          <Text style={styles.value}>{servicio.descripcion}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Fecha de Inicio:</Text>
          <Text style={styles.value}>{formatDate(servicio.fechaInicio)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Fecha de Finalización:</Text>
          <Text style={styles.value}>{formatDate(servicio.fechaFin)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, styles.statusText]}>{servicio.estado}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Fecha de Creación:</Text>
          <Text style={styles.value}>{formatDate(servicio.fechaCreacion)}</Text>
        </View>

        <View style={styles.diasServicioSection}>
          <Text style={styles.sectionTitle}>Días de Servicio</Text>
          
          {diasServicio.length > 0 ? (
            <View style={styles.gridContainer}>
              {diasServicio.map((dia) => (
                <TouchableOpacity
                  key={dia.id}
                  style={styles.gridItem}
                  onPress={() => {
                    navigation.navigate('MainApp', {
                      screen: 'Servicios',
                      params: {
                        screen: 'DetalleDiaServicio',
                        params: { 
                          diaServicio: dia,
                          servicioId: servicio.id
                        }
                      }
                    });
                  }}
                >
                  <Text style={styles.gridDate}>
                    {new Date(dia.fecha.seconds * 1000).toLocaleDateString()}
                  </Text>
                  <Text style={styles.gridDay}>
                    {getDayOfWeek(dia.fecha)}
                  </Text>
                  <Text style={styles.gridType}>
                    {dia.tipoServicioId}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noDiasText}>No hay días de servicio registrados</Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AgregarDiaServicio', { servicioId: servicio.id })}
        >
          <Text style={styles.addButtonText}>Agregar Día de Servicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  detailRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },
  statusText: {
    textTransform: 'capitalize',
    color: '#27ae60',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  diasServicioSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridItem: {
    width: '48%', // Two items per row with some spacing
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gridDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  gridDay: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  gridType: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  noDiasText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default DetalleServicioScreen;