import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';  // Add this import

const AgregarDiaServicioScreen = ({ route, navigation }) => {
  const { servicioId } = route.params;
  const [fecha, setFecha] = useState(new Date());
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [hora, setHora] = useState('19:00');
  const [tiposServicio, setTiposServicio] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    cargarTiposServicio();
  }, []);

  const cargarTiposServicio = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tiposServicio'));
      const tipos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTiposServicio(tipos);
      if (tipos.length > 0) setTipoServicioId(tipos[0].id);
    } catch (error) {
      console.error('Error al cargar tipos de servicio:', error);
    }
  };

  const handleGuardar = async () => {
    try {
      await addDoc(collection(db, 'diasServicio'), {
        servicioId,
        fecha,
        tipoServicioId,
        hora,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      Alert.alert('Éxito', 'Día de servicio agregado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar el día de servicio');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Día de Servicio</Text>

      <TouchableOpacity 
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.datePickerButtonText}>
          <Ionicons name="calendar-outline" size={20} color="#2c3e50" />
          {' '}Seleccionar Fecha: {fecha.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={fecha}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tipo de Servicio:</Text>
        <Picker
          selectedValue={tipoServicioId}
          onValueChange={setTipoServicioId}
          style={styles.picker}
        >
          {tiposServicio.map(tipo => (
            <Picker.Item 
              key={tipo.id} 
              label={tipo.nombre} 
              value={tipo.id} 
            />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Hora:</Text>
        <Picker
          selectedValue={hora}
          onValueChange={setHora}
          style={styles.picker}
        >
          <Picker.Item label="09:00" value="09:00" />
          <Picker.Item label="10:00" value="10:00" />
          <Picker.Item label="19:00" value="19:00" />
          <Picker.Item label="19:30" value="19:30" />
        </Picker>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleGuardar}
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
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
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
});

export default AgregarDiaServicioScreen;