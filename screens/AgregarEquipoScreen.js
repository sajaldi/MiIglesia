import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AgregarEquipoScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [anciano, setAnciano] = useState('');
  const [miembros, setMiembros] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    loadAvailableMembers();
  }, []);

  const loadAvailableMembers = async () => {
    try {
      const miembrosRef = collection(db, 'miembros');
      const querySnapshot = await getDocs(miembrosRef);
      const miembrosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableMembers(miembrosData);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !anciano) {
      Alert.alert('Error', 'Por favor ingrese el nombre del equipo y seleccione un anciano');
      return;
    }

    try {
      const equipoRef = collection(db, 'equipos');
      await addDoc(equipoRef, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        anciano: anciano,
        miembros: miembros,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'No se pudo crear el equipo');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del equipo"
          value={nombre}
          onChangeText={setNombre}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        {/* Anciano Selection */}
        <Text style={styles.label}>Anciano del Equipo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={anciano}
            onValueChange={(itemValue) => setAnciano(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un anciano" value="" />
            {availableMembers.map(member => (
              <Picker.Item 
                key={member.id} 
                label={`${member.nombre} ${member.apellido}`} 
                value={member.id} 
              />
            ))}
          </Picker>
        </View>

        {/* Existing members selection */}
        <Text style={styles.label}>Miembros del Equipo</Text>
        {/* ... existing members selection code ... */}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Crear Equipo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
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
  label: {
    fontSize: 16,
    color: '#2d4150',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});

export default AgregarEquipoScreen;