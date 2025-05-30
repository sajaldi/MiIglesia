import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Checklist from '../models/Checklist';

const SeleccionarChecklistScreen = ({ route, navigation }) => {
  const { diaServicioId } = route.params;
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const allChecklists = await Checklist.getAll();
      setChecklists(allChecklists);
    } catch (error) {
      console.error('Error loading checklists:', error);
    }
  };

  const handleSelect = async (checklist) => {
    try {
      // Update the dia servicio with the selected checklist
      await updateDiaServicio(diaServicioId, checklist.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error selecting checklist:', error);
    }
  };

  const updateDiaServicio = async (diaServicioId, checklistId) => {
    const diaServicioRef = doc(db, 'diasServicio', diaServicioId);
    await updateDoc(diaServicioRef, {
      checklistId: checklistId
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.checklistItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.checklistName}>{item.nombre}</Text>
      <Text style={styles.checklistDesc}>{item.descripcion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={checklists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  checklistItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  checklistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  checklistDesc: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default SeleccionarChecklistScreen;