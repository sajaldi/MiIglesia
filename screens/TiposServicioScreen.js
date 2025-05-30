import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const TiposServicioScreen = () => {
  const [tiposServicio, setTiposServicio] = useState([]);
  const [nombreTipo, setNombreTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');

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
    } catch (error) {
      console.error('Error al cargar tipos:', error);
    }
  };

  const handleAgregar = async () => {
    if (!nombreTipo.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      await addDoc(collection(db, 'tiposServicio'), {
        nombre: nombreTipo,
        descripcion: descripcion,
        createdAt: new Date()
      });
      setNombreTipo('');
      setDescripcion('');
      cargarTiposServicio();
      Alert.alert('Éxito', 'Tipo de servicio agregado correctamente');
    } catch (error) {
      console.error('Error al agregar:', error);
      Alert.alert('Error', 'No se pudo agregar el tipo de servicio');
    }
  };

  const handleEliminar = async (id) => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de eliminar este tipo de servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tiposServicio', id));
              cargarTiposServicio();
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar el tipo de servicio');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.tipoItem}>
      <View style={styles.tipoInfo}>
        <Text style={styles.tipoNombre}>{item.nombre}</Text>
        <Text style={styles.tipoDescripcion}>{item.descripcion}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleEliminar(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del tipo de servicio"
          value={nombreTipo}
          onChangeText={setNombreTipo}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAgregar}
        >
          <Text style={styles.addButtonText}>Agregar Tipo de Servicio</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tiposServicio}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.lista}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lista: {
    flex: 1,
  },
  tipoItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  tipoInfo: {
    flex: 1,
  },
  tipoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tipoDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
  },
});

export default TiposServicioScreen;