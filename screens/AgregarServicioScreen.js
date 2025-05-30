import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AgregarServicioScreen = ({ navigation }) => {
  const [nombreServicio, setNombreServicio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoServicio, setTipoServicio] = useState('regular');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [equipoId, setEquipoId] = useState('');
  const [equipos, setEquipos] = useState([]);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Remove isStartDatePickerVisible and isEndDatePickerVisible states as they're redundant

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);
      if (equiposData.length > 0) setEquipoId(equiposData[0].id);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  };

  const handleGuardar = async () => {
    if (!nombreServicio || !equipoId || !descripcion) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'servicios'), {
        nombre: nombreServicio,
        descripcion,
        tipoServicio,
        fechaInicio,
        fechaFin,
        equipoId,
        fechaCreacion: new Date(),
        miembros: [],
        estado: 'activo'
      });

      Alert.alert('Éxito', 'Servicio guardado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateConfirm = (date) => {
    setFechaInicio(date);
    setStartDatePickerVisible(false);
  };

  const handleEndDateConfirm = (date) => {
    setFechaFin(date);
    setEndDatePickerVisible(false);
  };

  const showStartDatepicker = () => {
    setShowStartDate(true);
  };

  const showEndDatepicker = () => {
    setShowEndDate(true);
  };

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaInicio;
    setShowStartDate(Platform.OS === 'ios');
    setFechaInicio(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaFin;
    setShowEndDate(Platform.OS === 'ios');
    setFechaFin(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Servicio"
          value={nombreServicio}
          onChangeText={setNombreServicio}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Tipo de Servicio</Text>
          <Picker
            selectedValue={tipoServicio}
            style={styles.picker}
            onValueChange={(itemValue) => setTipoServicio(itemValue)}
          >
            <Picker.Item label="Regular" value="regular" />
            <Picker.Item label="Especial" value="especial" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Equipo</Text>
          <Picker
            selectedValue={equipoId}
            style={styles.picker}
            onValueChange={(itemValue) => setEquipoId(itemValue)}
          >
            {equipos.map((equipo) => (
              <Picker.Item key={equipo.id} label={equipo.nombre} value={equipo.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={showStartDatepicker}>
          <Text>Fecha de Inicio: {fechaInicio.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showStartDate && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            onChange={onStartDateChange}
          />
        )}

        <TouchableOpacity style={styles.dateButton} onPress={showEndDatepicker}>
          <Text>Fecha de Fin: {fechaFin.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showEndDate && (
          <DateTimePicker
            value={fechaFin}
            mode="date"
            onChange={onEndDateChange}
          />
        )}

        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.7 }]}
          onPress={handleGuardar}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Guardando...' : 'Guardar Servicio'}
          </Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
});

export default AgregarServicioScreen;