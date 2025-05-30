import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checklist from '../../models/Checklist';

const ChecklistsScreen = ({ navigation }) => {
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const data = await Checklist.getAll();
      setChecklists(data);
    } catch (error) {
      console.error('Error loading checklists:', error);
      Alert.alert('Error', 'No se pudieron cargar las checklists');
    }
  };

  const handleDelete = async (checklist) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro de eliminar esta checklist?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await checklist.delete();
              loadChecklists();
            } catch (error) {
              console.error('Error deleting checklist:', error);
              Alert.alert('Error', 'No se pudo eliminar la checklist');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.checklistItem}
      onPress={() => navigation.navigate('EditarChecklist', { checklist: item })}
    >
      <View style={styles.checklistInfo}>
        <Text style={styles.checklistName}>{item.nombre}</Text>
        <Text style={styles.checklistDesc}>{item.descripcion}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AgregarChecklist')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Nueva Checklist</Text>
      </TouchableOpacity>

      <FlatList
        data={checklists}
        renderItem={renderItem}
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
    padding: 15,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  checklistItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checklistDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
  },
  list: {
    flex: 1,
  },
});

export default ChecklistsScreen;