import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ListaServiciosScreen = ({ navigation }) => {
  const [servicios, setServicios] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cargarServicios = async () => {
    try {
      console.log('Cargando servicios...');
      const querySnapshot = await getDocs(collection(db, 'servicios'));
      const serviciosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await cargarServicios();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    cargarServicios();
  }, []);

  const serviciosFiltrados = servicios.filter(servicio => 
    servicio.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLongPress = (servicio) => {
    if (global.userRole !== 'admin') return;
    
    Alert.alert(
      'Opciones de Servicio',
      `${servicio.nombre}`,
      [
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EditarServicio', { servicio }),
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

  const handleDelete = async (servicio) => {
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
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'servicios', servicio.id));
              await cargarServicios();
              Alert.alert('Éxito', 'Servicio eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar servicio:', error);
              Alert.alert('Error', 'No se pudo eliminar el servicio');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('DetalleServicio', { servicio: item })}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.miembros}>
        {item.miembros ? item.miembros.length : 0} miembros
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar servicio..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={serviciosFiltrados}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  lista: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miembros: {
    fontSize: 14,
    color: '#666',
  },
});











export default ListaServiciosScreen;