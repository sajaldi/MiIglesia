import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checklist from '../../models/Checklist';
import ChecklistItem from '../../models/ChecklistItem';

const EditarChecklistScreen = ({ route, navigation }) => {
  const { checklist } = route.params;
  const [nombre, setNombre] = useState(checklist.nombre);
  const [descripcion, setDescripcion] = useState(checklist.descripcion);
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const checklistItems = await ChecklistItem.getByChecklist(checklist.id);
      setItems(checklistItems);
    } catch (error) {
      console.error('Error loading checklist items:', error);
      Alert.alert('Error', 'No se pudieron cargar los items');
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    try {
      const newItem = await ChecklistItem.create({
        checklistId: checklist.id,
        descripcion: newItemText,
        orden: items.length
      });
      setItems([...items, newItem]);
      setNewItemText('');
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'No se pudo agregar el item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const item = items.find(i => i.id === itemId);
      await item.delete();
      setItems(items.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'No se pudo eliminar el item');
    }
  };

  const handleUpdateChecklist = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      const checklistObj = new Checklist(checklist);
      await checklistObj.update({
        nombre,
        descripcion,
      });
      
      Alert.alert('Éxito', 'Checklist actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating checklist:', error);
      Alert.alert('Error', 'No se pudo actualizar la checklist');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.descripcion}</Text>
      <TouchableOpacity 
        onPress={() => handleDeleteItem(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre de la checklist"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción de la checklist"
          multiline
          numberOfLines={4}
        />

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items de la Checklist</Text>
          
          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.addItemInput}
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="Nuevo item"
            />
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={handleAddItem}
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleUpdateChecklist}
        >
          <Text style={styles.submitButtonText}>Actualizar Checklist</Text>
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
  form: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  itemsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  addItemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 16,
  },
  addItemButton: {
    backgroundColor: '#2ecc71',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  deleteButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditarChecklistScreen;