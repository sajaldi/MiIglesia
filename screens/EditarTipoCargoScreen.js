import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const EditarTipoCargoScreen = ({ route, navigation }) => {
  const { cargo } = route.params;
  const [nombre, setNombre] = useState(cargo.nombre);
  const [jerarquia, setJerarquia] = useState(cargo.jerarquia?.toString() || '0');

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (isNaN(Number(jerarquia))) {
      Alert.alert('Error', 'La jerarquía debe ser un número');
      return;
    }

    try {
      const cargoRef = doc(db, 'tipoCargos', cargo.id);
      await updateDoc(cargoRef, {
        nombre,
        jerarquia: Number(jerarquia),
        updatedAt: new Date()
      });

      Alert.alert('Éxito', 'Cargo actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating cargo:', error);
      Alert.alert('Error', 'No se pudo actualizar el cargo');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del Cargo</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre del cargo"
      />

      <Text style={styles.label}>Jerarquía</Text>
      <TextInput
        style={styles.input}
        value={jerarquia}
        onChangeText={setJerarquia}
        placeholder="Número de jerarquía (menor = mayor rango)"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#70d7c7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditarTipoCargoScreen;