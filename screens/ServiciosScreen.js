import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ServiciosScreen = () => {
  const [servicios] = useState([
    { id: '1', nombre: 'Servicio Dominical', horario: '9:00 AM' },
    { id: '2', nombre: 'Estudio Bíblico', horario: '7:00 PM' },
    { id: '3', nombre: 'Oración', horario: '6:00 PM' },
  ]);

  const handleLongPress = (servicio) => {
    if (global.userRole !== 'admin') return;
    
    Alert.alert(
      'Opciones de Servicio',
      `${servicio.nombre}`,
      [
        {
          text: 'Editar',
          onPress: () => handleEdit(servicio),
        },
        {
          text: 'Eliminar',
          onPress: () => handleDelete(servicio),
          style: 'destructive',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleEdit = (servicio) => {
    // Implement edit functionality
    console.log('Editar:', servicio);
  };

  const handleDelete = (servicio) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar ${servicio.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            // Implement delete functionality
            console.log('Eliminar:', servicio);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderServicio = ({ item }) => (
    <TouchableOpacity 
      style={styles.servicioCard}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <View style={styles.servicioInfo}>
        <Text style={styles.servicioNombre}>{item.nombre}</Text>
        <Text style={styles.servicioHorario}>{item.horario}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#70d7c7" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={servicios}
        renderItem={renderServicio}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  servicioCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  servicioInfo: {
    flex: 1,
  },
  servicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 4,
  },
  servicioHorario: {
    fontSize: 14,
    color: '#666',
  },
});

export default ServiciosScreen;