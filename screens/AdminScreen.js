import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { collection, query, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';

const AdminScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [cargos, setCargos] = useState([]);

  useEffect(() => {
    loadUsers();
    loadCargos();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'usuarios');
      const querySnapshot = await getDocs(usersRef);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const changeRole = async (userId, currentRole) => {
    const roles = ['admin', 'lider', 'miembro'];
    const currentIndex = roles.indexOf(currentRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];

    try {
      await updateDoc(doc(db, 'usuarios', userId), {
        rol: nextRole
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF6B6B';
      case 'lider': return '#4ECDC4';
      case 'miembro': return '#45B7D1';
      default: return '#666';
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nombre || 'Sin nombre'}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={[styles.roleButton, { backgroundColor: getRoleColor(item.rol) }]}
        onPress={() => changeRole(item.id, item.rol)}
      >
        <Text style={styles.roleText}>{item.rol || 'sin rol'}</Text>
        <Ionicons name="chevron-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const AdminMenuItem = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#2d4150" />
      <Text style={styles.menuItemText}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#2d4150" />
    </TouchableOpacity>
  );

  const loadCargos = async () => {
    try {
      const cargosRef = collection(db, 'cargos');
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

  const renderCargo = ({ item }) => (
    <View style={styles.cargoCard}>
      <Text style={styles.cargoName}>{item.nombre}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={async () => {
          try {
            await deleteDoc(doc(db, 'cargos', item.id));
            loadCargos();
          } catch (error) {
            console.error('Error deleting cargo:', error);
          }
        }}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      
      {/* Menú de Administración Original */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Configuración General</Text>
        <AdminMenuItem
          title="Tipos de Servicio"
          icon="list-outline"
          onPress={() => navigation.navigate('TiposServicio')}
        />
        <AdminMenuItem
          title="Equipos"
          icon="people-outline"
          onPress={() => navigation.navigate('ListaEquipos')}
        />
        <AdminMenuItem
          title="Configuración de Eventos"
          icon="calendar-outline"
          onPress={() => navigation.navigate('ConfigEventos')}
        />
        <AdminMenuItem
          title="Tipos de Cargo"
          icon="briefcase-outline"
          onPress={() => navigation.navigate('TipoCargo')}
        />
        <AdminMenuItem
          title="Miembros"
          icon="people-outline"
          onPress={() => {
            navigation.navigate('ListaMiembros');
          }}
        />
        <AdminMenuItem
          title="Checklists"
          icon="checkbox-outline"
          onPress={() => navigation.navigate('Checklists')}
        />
      </View>

      {/* Gestión de Usuarios */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Nueva sección de Tipos de Cargos */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Tipos de Cargos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => {
            try {
              await addDoc(collection(db, 'cargos'), {
                nombre: 'Nuevo Cargo',
                fechaCreacion: new Date()
              });
              loadCargos();
            } catch (error) {
              console.error('Error adding cargo:', error);
            }
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#70d7c7" />
          <Text style={styles.addButtonText}>Agregar Cargo</Text>
        </TouchableOpacity>
        <FlatList
          data={cargos}
          renderItem={renderCargo}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#2d4150',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2d4150',
    marginLeft: 12,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  roleText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 4,
  },
  cargoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cargoName: {
    fontSize: 16,
    color: '#2d4150',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#70d7c7',
  },
});

export default AdminScreen;