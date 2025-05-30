import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditarServicioScreen = ({ route, navigation }) => {
  const { servicio } = route.params;
  const [nombre, setNombre] = useState(servicio.nombre);
  const [fechaInicio, setFechaInicio] = useState(new Date(servicio.fechaInicio.seconds * 1000));
  const [fechaFin, setFechaFin] = useState(new Date(servicio.fechaFin.seconds * 1000));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      const servicioRef = doc(db, 'servicios', servicio.id);
      await updateDoc(servicioRef, {
        nombre: nombre.trim(),
        fechaInicio,
        fechaFin,
        updatedAt: new Date()
      });
      Alert.alert('Éxito', 'Servicio actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el servicio');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Nombre del Servicio</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del servicio"
        />

        <Text style={styles.label}>Fecha de Inicio</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text>{fechaInicio.toLocaleDateString()}</Text>
          <Ionicons name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Fecha de Finalización</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text>{fechaFin.toLocaleDateString()}</Text>
          <Ionicons name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        {showStartDatePicker && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setFechaInicio(selectedDate);
              }
            }}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={fechaFin}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setFechaFin(selectedDate);
              }
            }}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4150',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  dateInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#70d7c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditarServicioScreen;