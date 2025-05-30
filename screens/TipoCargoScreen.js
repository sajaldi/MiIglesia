import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

const TipoCargoScreen = () => {
  const [cargos, setCargos] = useState([]);
  const [newCargoName, setNewCargoName] = useState('');
  const [editingCargo, setEditingCargo] = useState(null);

  useEffect(() => {
    loadCargos();
  }, []);

  const loadCargos = async () => {
    try {
      const cargosRef = collection(db, 'tipoCargos');
      const querySnapshot = await getDocs(cargosRef);
      const cargosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCargos(cargosData);
    } catch (error) {
      console.error('Error loading cargos:', error);
    }
  };

  const handleAddCargo = async () => {
    if (!newCargoName.trim()) return;
    try {
      await addDoc(collection(db, 'tipoCargos'), {
        nombre: newCargoName,
        fechaCreacion: new Date()
      });
      setNewCargoName('');
      loadCargos();
    } catch (error) {
      console.error('Error adding cargo:', error);
    }
  };

  const handleUpdateCargo = async (id, newName) => {
    try {
      await updateDoc(doc(db, 'tipoCargos', id), {
        nombre: newName
      });
      setEditingCargo(null);
      loadCargos();
    } catch (error) {
      console.error('Error updating cargo:', error);
    }
  };

  const handleDeleteCargo = async (id) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar este cargo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tipoCargos', id));
              loadCargos();
            } catch (error) {
              console.error('Error deleting cargo:', error);
            }
          }
        }
      ]
    );
  };

  const renderCargo = ({ item }) => (
    <View style={styles.cargoCard}>
      {editingCargo === item.id ? (
        <TextInput
          style={styles.editInput}
          value={item.nombre}
          onChangeText={(text) => {
            setCargos(cargos.map(cargo =>
              cargo.id === item.id ? { ...cargo, nombre: text } : cargo
            ));
          }}
          onBlur={() => handleUpdateCargo(item.id, item.nombre)}
        />
      ) : (
        <Text style={styles.cargoName}>{item.nombre}</Text>
      )}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditingCargo(item.id)}
        >
          <Ionicons name="pencil" size={20} color="#4ECDC4" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCargo(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del cargo"
          value={newCargoName}
          onChangeText={setNewCargoName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddCargo}>
          <Ionicons name="add-circle" size={24} color="#70d7c7" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={cargos}
        renderItem={renderCargo}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  addSection: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  cargoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cargoName: {
    fontSize: 16,
    color: '#2d4150',
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#70d7c7',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
});

export default TipoCargoScreen;