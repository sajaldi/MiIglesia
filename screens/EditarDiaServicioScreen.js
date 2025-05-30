import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, FlatList, Switch, ScrollView, Modal, TextInput } from 'react-native';
import { db } from '../config/firebase';
import { doc, updateDoc, deleteDoc, getDocs, collection, query, where, addDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const EditarDiaServicioScreen = ({ route, navigation }) => {
  const { diaServicio, servicioId, onUpdate } = route.params;
  const [fecha, setFecha] = useState(new Date(diaServicio.fecha.seconds * 1000));
  const [tipoServicioId, setTipoServicioId] = useState(diaServicio.tipoServicioId);
  const [hora, setHora] = useState(diaServicio.hora);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [miembrosEquipo, setMiembrosEquipo] = useState([]);
  const [asistencia, setAsistencia] = useState({});
  
  // Add these new states for the checklist modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCheckItem, setSelectedCheckItem] = useState(null);
  const [checkValue, setCheckValue] = useState('');

  const cargarTiposServicio = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tiposServicio'));
      const tipos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTiposServicio(tipos);
    } catch (error) {
      console.error('Error al cargar tipos de servicio:', error);
      Alert.alert('Error', 'No se pudieron cargar los tipos de servicio');
    }
  };

  const handleGuardar = async () => {
    try {
      await updateDoc(doc(db, 'diasServicio', diaServicio.id), {
        fecha,
        tipoServicioId,
        hora,
        updatedAt: new Date()
      });

      Alert.alert('Éxito', 'Día de servicio actualizado correctamente');
      onUpdate && onUpdate();
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el día de servicio');
    }
  };

  const handleEliminar = async () => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de eliminar este día de servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all attendance records first
              const asistenciaSnapshot = await getDocs(query(
                collection(db, 'asistencia'),
                where('diaServicioId', '==', diaServicio.id)
              ));
              
              // Delete each attendance record
              const deletePromises = asistenciaSnapshot.docs.map(doc => 
                deleteDoc(doc.ref)
              );
              await Promise.all(deletePromises);

              // Then delete the service day
              await deleteDoc(doc(db, 'diasServicio', diaServicio.id));
              
              Alert.alert('Éxito', 'Día de servicio eliminado correctamente');
              onUpdate && onUpdate();
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar el día de servicio');
            }
          }
        }
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  useEffect(() => {
    cargarTiposServicio();
    cargarMiembrosEquipo();
    cargarAsistencia();
  }, []);

  const cargarMiembrosEquipo = async () => {
    try {
      // First, get the servicioId to find the related team
      const servicioDoc = await getDocs(query(
        collection(db, 'servicios'),
        where('id', '==', servicioId)
      ));
      
      if (!servicioDoc.empty) {
        const servicio = servicioDoc.docs[0].data();
        const equipoId = servicio.equipoId;

        // Get team members
        const miembrosSnapshot = await getDocs(query(
          collection(db, 'miembrosEquipo'),
          where('equipoId', '==', equipoId)
        ));

        const miembros = [];
        for (const doc of miembrosSnapshot.docs) {
          const miembroData = doc.data();
          // Get member details
          const miembroDoc = await getDocs(query(
            collection(db, 'miembros'),
            where('id', '==', miembroData.miembroId)
          ));
          
          if (!miembroDoc.empty) {
            miembros.push({
              id: doc.id,
              ...miembroData,
              ...miembroDoc.docs[0].data()
            });
          }
        }
        setMiembrosEquipo(miembros);
      }
    } catch (error) {
      console.error('Error al cargar miembros:', error);
    }
  };

  const cargarAsistencia = async () => {
    try {
      const asistenciaSnapshot = await getDocs(query(
        collection(db, 'asistencia'),
        where('diaServicioId', '==', diaServicio.id)
      ));

      const asistenciaData = {};
      asistenciaSnapshot.docs.forEach(doc => {
        const data = doc.data();
        asistenciaData[data.miembroId] = {
          id: doc.id,
          ...data
        };
      });
      setAsistencia(asistenciaData);
    } catch (error) {
      console.error('Error al cargar asistencia:', error);
    }
  };

  const toggleAsistencia = async (miembro) => {
    try {
      const miembroId = miembro.id;
      if (asistencia[miembroId]) {
        // Delete attendance
        await deleteDoc(doc(db, 'asistencia', asistencia[miembroId].id));
        const newAsistencia = { ...asistencia };
        delete newAsistencia[miembroId];
        setAsistencia(newAsistencia);
      } else {
        // Add new attendance
        const docRef = await addDoc(collection(db, 'asistencia'), {
          diaServicioId: diaServicio.id,
          miembroId,
          fecha: new Date(),
          presente: true
        });
        setAsistencia(prev => ({
          ...prev,
          [miembroId]: {
            id: docRef.id,
            miembroId,
            presente: true
          }
        }));
      }
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      Alert.alert('Error', 'No se pudo actualizar la asistencia');
    }
  };

  const renderMiembro = ({ item }) => (
    <TouchableOpacity 
      style={styles.miembroItem}
      onPress={() => toggleAsistencia(item)}
    >
      <Text style={styles.miembroNombre}>{item.nombre}</Text>
      <Switch
        value={!!asistencia[item.id]}
        disabled={true}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={asistencia[item.id] ? '#2196F3' : '#f4f3f4'}
      />
    </TouchableOpacity>
  );

  // Add this new function to render the checklist
  // Add new state at the top with other states
  const [checkItems, setCheckItems] = useState([]);
  
  // Add this function to load checklist items
  const cargarCheckItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'checklistItems'));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCheckItems(items);
    } catch (error) {
      console.error('Error al cargar items del checklist:', error);
      Alert.alert('Error', 'No se pudieron cargar los items del checklist');
    }
  };
  
  // Update the useEffect to include cargarCheckItems
  useEffect(() => {
    cargarTiposServicio();
    cargarMiembrosEquipo();
    cargarAsistencia();
    cargarCheckItems(); // Add this line
  }, []);
  
  // Add new state at the top
  const [editingChecklist, setEditingChecklist] = useState(false);
  
  // Update the renderChecklist function
  const renderChecklist = () => {
    return (
      <View style={styles.checklistContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditingChecklist(!editingChecklist)}
          >
            <Ionicons 
              name={editingChecklist ? "checkmark-circle" : "create-outline"} 
              size={24} 
              color={editingChecklist ? "#2ecc71" : "#3498db"} 
            />
          </TouchableOpacity>
        </View>
        {checkItems.map(item => (
          <TouchableOpacity 
            key={item.id}
            style={styles.checkItem}
            onPress={() => {
              setSelectedCheckItem(item);
              setCheckValue(diaServicio[item.id] || '');
              setObservacion(diaServicio[`${item.id}_observacion`] || '');
              setModalVisible(true);
            }}
          >
            <View style={styles.checkItemIcon}>
              <Ionicons 
                name={diaServicio[item.id] ? "checkmark-circle" : "arrow-forward-circle"} 
                size={28} 
                color={diaServicio[item.id] ? "#2ecc71" : "#7f8c8d"} 
              />
            </View>
            <View style={styles.checkItemContent}>
              <Text style={styles.checkItemText}>{item.titulo}</Text>
              <View style={styles.checkItemValues}>
                {diaServicio[item.id] && <Text style={styles.checkItemMainValue}>{diaServicio[item.id]}</Text>}
                {diaServicio[`${item.id}_observacion`] && (
                  <Text style={styles.checkItemObservacion}>
                    {diaServicio[`${item.id}_observacion`]}
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Add new styles to the StyleSheet
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    datePickerButton: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
      marginBottom: 20,
    },
    datePickerButtonText: {
      fontSize: 16,
      color: '#2c3e50',
      textAlign: 'center',
    },
    pickerContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#7f8c8d',
      marginBottom: 5,
    },
    picker: {
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
    },
    saveButton: {
      backgroundColor: '#3498db',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    asistenciaSection: {
      marginTop: 20,
    },
    listaContainer: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 15,
    },
    miembroItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: 'white',
      borderRadius: 8,
      marginBottom: 10,
      elevation: 1,
    },
    miembroNombre: {
      fontSize: 16,
      color: '#2c3e50',
    },
    lista: {
      flex: 1,
    },
    // Add these styles if they're missing
    checklistContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
    checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      backgroundColor: 'white',
      borderRadius: 8,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    },
    checkItemContent: {
      flex: 1,
    },
    checkItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2c3e50',
    },
    checkItemValue: {
      fontSize: 14,
      color: '#7f8c8d',
      marginTop: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      width: '85%',
      maxWidth: 400,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 20,
      textAlign: 'center',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      padding: 12,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#95a5a6',
    },
    saveModalButton: {
      backgroundColor: '#3498db',
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

}; // Close the EditarDiaServicioScreen component

export default EditarDiaServicioScreen;
