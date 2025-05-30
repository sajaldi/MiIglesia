import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const EquiposScreen = ({ navigation }) => {
  const [equipos, setEquipos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const cargarEquipos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error al cargar equipos:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await cargarEquipos();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const handleLongPress = (equipo) => {
    if (global.userRole !== 'admin') return;
    
    Alert.alert(
      'Opciones de Equipo',
      `${equipo.nombre}`,
      [
        {
          text: 'Editar',
          onPress: () => navigation.navigate('EditarEquipo', { equipo }),
        },
        {
          text: 'Eliminar',
          onPress: () => handleDelete(equipo),
          style: 'destructive',
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const renderEquipo = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: item.color || '#70d7c7' }]}
      onPress={() => navigation.navigate('DetalleEquipo', { equipo: item })}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <View style={styles.cardContent}>
        {item.photoUri ? (
          <Image 
            source={{ uri: item.photoUri }} 
            style={styles.equipoImage}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: item.color + '40' }]}>
            <Ionicons name="people" size={30} color={item.color || '#70d7c7'} />
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.miembros}>
            {item.miembros ? item.miembros.length : 0} miembros
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#70d7c7" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipos}
        renderItem={renderEquipo}
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
  lista: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  equipoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 4,
  },
  miembros: {
    fontSize: 14,
    color: '#666',
  },
});

export default EquiposScreen;