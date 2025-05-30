import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

const DetalleEquipoScreen = ({ route, navigation }) => {
  const { equipo } = route.params;
  const [miembrosEquipo, setMiembrosEquipo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipoLocal, setEquipoLocal] = useState(equipo);

  const cargarMiembrosEquipo = async () => {
    try {
      setLoading(true);
      // First get all cargos
      const cargosSnapshot = await getDocs(collection(db, 'tipoCargos'));
      const cargosMap = {};
      cargosSnapshot.docs.forEach(doc => {
        cargosMap[doc.id] = doc.data().nombre;
      });

      const querySnapshot = await getDocs(collection(db, 'miembros'));
      const todosLosMiembros = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        cargoNombre: cargosMap[doc.data().cargo] || 'Miembro'
      }));
      
      // Get updated equipo data
      const equipoRef = doc(db, 'equipos', equipo.id);
      const equipoDoc = await getDoc(equipoRef);
      if (equipoDoc.exists()) {
        const equipoData = equipoDoc.data();
        setEquipoLocal({
          ...equipoLocal,
          miembros: equipoData.miembros || []
        });
      }
      
      const miembrosDelEquipo = todosLosMiembros.filter(miembro => 
        equipoLocal.miembros?.includes(miembro.id)
      );

      // Sort members by role
      const roleOrder = {
        'anciano': 1,
        'diacono': 2,
        'coordinador': 3,
        'miembro': 4
      };

      const miembrosOrdenados = miembrosDelEquipo.sort((a, b) => {
        const roleA = roleOrder[a.cargoNombre?.toLowerCase()] || 5;
        const roleB = roleOrder[b.cargoNombre?.toLowerCase()] || 5;
        if (roleA !== roleB) return roleA - roleB;
        return (a.nombre + ' ' + a.apellido).localeCompare(b.nombre + ' ' + b.apellido);
      });
      
      setMiembrosEquipo(miembrosOrdenados);
    } catch (error) {
      console.error('Error al cargar miembros:', error);
      Alert.alert('Error', 'No se pudieron cargar los miembros');
    } finally {
      setLoading(false);
    }
  };

  // In your renderMiembro function, modify the navigation call:
  const renderMiembro = ({ item }) => (
    <TouchableOpacity 
      style={styles.miembroCard}
      onPress={() => {
        // Use nested navigation pattern
        navigation.navigate('MiembrosStack', {
          screen: 'DetalleMiembro',
          params: { miembro: item }
        });
      }}
    >
      <View>
        <Text style={styles.miembroNombre}>
          {item.nombre} {item.apellido}
        </Text>
        <Text style={[
          styles.miembroCargo,
          { color: equipoLocal.color }
        ]}>
          {item.cargoNombre}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const handleAddMember = async (miembro) => {
    try {
      setLoading(true);
      const equipoRef = doc(db, 'equipos', equipo.id);
      const miembrosActuales = equipoLocal.miembros || [];
      
      if (!miembrosActuales.includes(miembro.id)) {
        const nuevosMiembros = [...miembrosActuales, miembro.id];
        await updateDoc(equipoRef, {
          miembros: nuevosMiembros
        });
        
        // Update local state
        setEquipoLocal({
          ...equipoLocal,
          miembros: nuevosMiembros
        });
        await cargarMiembrosEquipo();
        Alert.alert('Éxito', 'Miembro agregado al equipo');
      } else {
        Alert.alert('Info', 'Este miembro ya está en el equipo');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'No se pudo agregar el miembro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMiembrosEquipo();
  }, []);

  const renderTeamInfo = () => (
    <View style={styles.teamInfoContainer}>
      {equipo.photoUri ? (
        <Image 
          source={{ uri: equipo.photoUri }} 
          style={styles.teamPhoto}
        />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: equipo.color + '40' }]}>
          <Ionicons name="people" size={40} color={equipo.color || '#70d7c7'} />
        </View>
      )}
      
      <View style={styles.teamDetails}>
        <Text style={styles.teamName}>{equipo.nombre}</Text>
        <View style={styles.colorContainer}>
          <View style={[styles.colorSquare, { backgroundColor: equipo.color }]} />
          <Text style={styles.colorText}>{equipo.color}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={cargarMiembrosEquipo}
        >
          <Ionicons name="refresh" size={24} color="#70d7c7" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditarEquipo', { equipo })}
        >
          <Ionicons name="pencil" size={24} color="#70d7c7" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: equipoLocal.color + '80' } // 80 represents 50% opacity in hex
    ]}>
      {renderTeamInfo()}
      
      <View style={[styles.sectionTitle, { backgroundColor: 'white' }]}>
        <Text style={styles.sectionTitleText}>Miembros del Equipo</Text>
        <Text style={styles.memberCount}>
          Total: {miembrosEquipo.length}
        </Text>
      </View>

      {loading ? (
        <Text style={[styles.loadingText, { color: '#fff' }]}>Cargando miembros...</Text>
      ) : (
        <FlatList
          ListHeaderComponent={<View />}
          data={miembrosEquipo}
          renderItem={renderMiembro}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: '#fff' }]}>No hay miembros en este equipo</Text>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  lista: {
    padding: 16,
  },
  miembroCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  miembroNombre: {
    fontSize: 16,
    flex: 1,
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
  saveButton: {
    backgroundColor: 'tomato',
    padding: 15,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamInfoContainer: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teamPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 8,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  colorText: {
    color: '#666',
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  memberCount: {
    color: '#666',
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  miembroCargo: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default DetalleEquipoScreen;