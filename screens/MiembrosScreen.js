import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

// Datos de ejemplo de miembros (esto lo reemplazaremos después)
const miembros = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    identidad: '0801-1985-12345',
    direccion: 'Barrio La Paz, Tegucigalpa',
    correo: 'juan.perez@email.com',
    telefono: '+504 9999-8888',
    foto: require('../assets/placeholder_profile.png'), // Asegúrate de tener esta imagen en la carpeta assets
  },
  {
    id: '2',
    nombre: 'María López',
    identidad: '0102-1992-67890',
    direccion: 'Colonia Kennedy, San Pedro Sula',
    correo: 'maria.lopez@email.com',
    telefono: '+504 3333-4444',
    foto: require('../assets/placeholder_profile.png'),
  },
  {
    id: '3',
    nombre: 'Carlos Gómez',
    identidad: '1503-1978-01010',
    direccion: 'La Ceiba',
    correo: 'carlos.gomez@email.com',
    telefono: '+504 9876-5432',
    foto: require('../assets/placeholder_profile.png'),
  },
];

const MiembrosScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.miembroContainer}>
      <Image source={item.foto} style={styles.fotoPerfil} />
      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.detalle}>Identidad: {item.identidad}</Text>
        <Text style={styles.detalle}>Dirección: {item.direccion}</Text>
        <Text style={styles.detalle}>Correo: {item.correo}</Text>
        <Text style={styles.detalle}>Teléfono: {item.telefono}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={miembros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  miembroContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fotoPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detalle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});

export default MiembrosScreen;