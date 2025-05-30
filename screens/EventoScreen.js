import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Evento from '../models/Evento';

const EventoScreen = ({ route, navigation }) => {
  const fechaInicial = route.params?.fecha ? new Date(route.params.fecha) : new Date();
  
  const [evento, setEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: fechaInicial,
    horaInicio: new Date(),
    horaFin: new Date(),
    tipo: 'general'
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeInicioPicker, setShowTimeInicioPicker] = useState(false);
  const [showTimeFinPicker, setShowTimeFinPicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEvento({ ...evento, fecha: selectedDate });
    }
  };

  const onTimeInicioChange = (event, selectedTime) => {
    setShowTimeInicioPicker(false);
    if (selectedTime) {
      setEvento({ ...evento, horaInicio: selectedTime });
    }
  };

  const onTimeFinChange = (event, selectedTime) => {
    setShowTimeFinPicker(false);
    if (selectedTime) {
      setEvento({ ...evento, horaFin: selectedTime });
    }
  };

  const guardarEvento = async () => {
    try {
      await Evento.crear(evento);
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar evento:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nuevo Evento</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={evento.titulo}
          onChangeText={(text) => setEvento({...evento, titulo: text})}
          placeholder="Título del evento"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {evento.fecha.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hora Inicio</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowTimeInicioPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {evento.horaInicio.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hora Fin</Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowTimeFinPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {evento.horaFin.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={evento.descripcion}
          onChangeText={(text) => setEvento({...evento, descripcion: text})}
          placeholder="Descripción del evento"
          multiline
          numberOfLines={4}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={evento.fecha}
          mode="date"
          onChange={onDateChange}
        />
      )}

      {showTimeInicioPicker && (
        <DateTimePicker
          value={evento.horaInicio}
          mode="time"
          onChange={onTimeInicioChange}
        />
      )}

      {showTimeFinPicker && (
        <DateTimePicker
          value={evento.horaFin}
          mode="time"
          onChange={onTimeFinChange}
        />
      )}

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={guardarEvento}
      >
        <Text style={styles.saveButtonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d4150',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2d4150',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2d4150',
  },
  saveButton: {
    backgroundColor: '#70d7c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventoScreen;