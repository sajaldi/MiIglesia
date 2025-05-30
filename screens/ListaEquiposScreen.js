import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

const ListaEquiposScreen = ({ navigation }) => {
  const [equipos, setEquipos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'equipos'));
      const equiposData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
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

  const handleLongPress = (item) => {
    navigation.navigate('Equipos', {
      screen: 'EditarEquipo',
      params: { equipo: item }
    });
  };

  const renderItem = ({ item }) => (
    <Menu>
      <MenuTrigger customStyles={{ 
        triggerWrapper: [
          styles.card,
          { 
            backgroundColor: 'white',
            borderLeftWidth: 5,
            borderLeftColor: item.color || '#70d7c7'
          }
        ] 
      }}>
        <View>
          <Text style={[
            styles.nombre,
            { color: item.color || '#2d4150' }
          ]}>
            {item.nombre}
          </Text>
          {item.miembros && (
            <Text style={[
              styles.memberCount,
              { color: item.color ? item.color + '99' : '#666' }
            ]}>
              Miembros: {item.miembros.length}
            </Text>
          )}
        </View>
      </MenuTrigger>
      <MenuOptions>
        <MenuOption onSelect={() => navigation.navigate('DetalleEquipo', { equipo: item })}>
          <Text style={styles.menuOption}>Ver Detalles</Text>
        </MenuOption>
        <MenuOption onSelect={() => handleLongPress(item)}>
          <Text style={styles.menuOption}>Editar</Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando equipos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {equipos.length === 0 ? (
        <Text style={styles.emptyText}>No hay equipos registrados</Text>
      ) : (
        <FlatList
          data={equipos}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  menuOption: {
    padding: 10,
    fontSize: 16,
  },
});

export default ListaEquiposScreen;