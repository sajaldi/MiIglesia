import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Miembro from '../models/Miembro';

const ListaMiembrosScreen = ({ navigation, route }) => {
  const [miembros, setMiembros] = useState([]);
  const [filteredMiembros, setFilteredMiembros] = useState([]);
  const [cargos, setCargos] = useState({});
  const [equipos, setEquipos] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeFilterType, setActiveFilterType] = useState('cargo'); // 'cargo' or 'equipo'
  const [miembrosMap, setMiembrosMap] = useState({}); // Map of member IDs to member objects

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMiembros();
      loadCargos();
      loadEquipos();
    }, [])
  );

  // Apply filters and search whenever the data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [miembros, searchQuery, activeFilter, activeFilterType]);

  const applyFiltersAndSearch = () => {
    let result = [...miembros];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(miembro => 
        (miembro.nombre && miembro.nombre.toLowerCase().includes(query)) || 
        (miembro.apellido && miembro.apellido.toLowerCase().includes(query)) ||
        (miembro.telefono && miembro.telefono.includes(query))
      );
    }
    
    // Apply category filter
    if (activeFilter !== 'Todos') {
      if (activeFilterType === 'cargo') {
        // Filter by cargo
        result = result.filter(miembro => {
          const cargoNombre = miembro.cargo ? cargos[miembro.cargo] : null;
          return cargoNombre === activeFilter;
        });
      } else if (activeFilterType === 'equipo') {
        // Filter by equipo
        result = result.filter(miembro => {
          if (!miembro.equipos || !Array.isArray(miembro.equipos)) return false;
          return miembro.equipos.some(equipoId => equipos[equipoId] === activeFilter);
        });
      }
    }
    
    setFilteredMiembros(result);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([loadMiembros(), loadCargos(), loadEquipos()])
      .finally(() => setRefreshing(false));
  }, []);

  const loadCargos = async () => {
    try {
      const cargosRef = collection(db, 'tipoCargos');
      const querySnapshot = await getDocs(cargosRef);
      const cargosData = {};
      querySnapshot.docs.forEach(doc => {
        cargosData[doc.id] = doc.data().nombre;
      });
      setCargos(cargosData);
    } catch (error) {
      console.error('Error loading cargos:', error);
    }
  };

  const loadEquipos = async () => {
    try {
      const equiposRef = collection(db, 'equipos');
      const querySnapshot = await getDocs(equiposRef);
      const equiposData = {};
      querySnapshot.docs.forEach(doc => {
        equiposData[doc.id] = doc.data().nombre;
      });
      setEquipos(equiposData);
    } catch (error) {
      console.error('Error loading equipos:', error);
    }
  };

  const loadMiembros = async () => {
    try {
      const miembrosRef = collection(db, 'miembros');
      const querySnapshot = await getDocs(miembrosRef);
      
      // Create a map of member IDs to member objects for easy lookup
      const miembrosMapData = {};
      const miembrosData = querySnapshot.docs.map(doc => {
        const miembro = Miembro.fromFirestore(doc);
        miembrosMapData[miembro.id] = miembro;
        return miembro;
      });
      
      setMiembrosMap(miembrosMapData);
      setMiembros(miembrosData);
      setFilteredMiembros(miembrosData);
    } catch (error) {
      console.error('Error loading miembros:', error);
    }
  };

  // Add this function to associate members with users by email
  const associateMemberWithUser = async (miembroId, userEmail) => {
    try {
      // Get the user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert('Error', 'No se encontró un usuario con ese email');
        return false;
      }
      
      const userId = querySnapshot.docs[0].id;
      
      // Update the member with the user ID
      const miembroRef = doc(db, 'miembros', miembroId);
      await updateDoc(miembroRef, {
        userId: userId,
        email: userEmail,
        updatedAt: new Date()
      });
      
      Alert.alert('Éxito', 'Miembro asociado con usuario correctamente');
      return true;
    } catch (error) {
      console.error('Error associating member with user:', error);
      Alert.alert('Error', 'No se pudo asociar el miembro con el usuario');
      return false;
    }
  };

  // Get family relationship info for display
  const getFamilyInfo = (miembro) => {
    if (!miembro) return null;
    
    const familyInfo = [];
    
    // Check for spouse
    if (miembro.conyuge && miembrosMap[miembro.conyuge]) {
      familyInfo.push(`Cónyuge: ${miembrosMap[miembro.conyuge].nombreCompleto}`);
    }
    
    // Check for children
    if (miembro.hijos && miembro.hijos.length > 0) {
      const hijosCount = miembro.hijos.filter(id => miembrosMap[id]).length;
      if (hijosCount > 0) {
        familyInfo.push(`Hijos: ${hijosCount}`);
      }
    }
    
    // Check for parents
    if (miembro.padres && miembro.padres.length > 0) {
      const padresCount = miembro.padres.filter(id => miembrosMap[id]).length;
      if (padresCount > 0) {
        familyInfo.push(`Padres: ${padresCount}`);
      }
    }
    
    return familyInfo.length > 0 ? familyInfo.join(' • ') : null;
  };

  const renderMiembro = ({ item }) => (
    <TouchableOpacity
      style={styles.miembroCard}
      onPress={() => {
        console.log('Navigating to DetalleMiembro with:', item); // Add this for debugging
        navigation.navigate('DetalleMiembro', { miembro: item });
      }}
    >
      <View style={styles.miembroInfo}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.miembroFoto} />
        ) : (
          <View style={styles.miembroFotoPlaceholder}>
            <Ionicons name="person" size={30} color="#70d7c7" />
          </View>
        )}
        <View style={styles.miembroTexto}>
          <Text style={styles.miembroNombre}>{`${item.nombre} ${item.apellido}`}</Text>
          <Text style={styles.miembroTelefono}>{item.telefono}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Get filter categories based on active filter type
  const getFilterCategories = () => {
    if (activeFilterType === 'cargo') {
      const uniqueCargos = new Set();
      Object.values(cargos).forEach(cargo => uniqueCargos.add(cargo));
      return ['Todos', ...Array.from(uniqueCargos)];
    } else {
      const uniqueEquipos = new Set();
      Object.values(equipos).forEach(equipo => uniqueEquipos.add(equipo));
      return ['Todos', ...Array.from(uniqueEquipos)];
    }
  };

  const renderFilterChip = (label) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.filterChip,
        activeFilter === label ? styles.activeFilterChip : null
      ]}
      onPress={() => setActiveFilter(label)}
    >
      <Text 
        style={[
          styles.filterChipText,
          activeFilter === label ? styles.activeFilterChipText : null
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterTypeChip = (type, label, icon) => (
    <TouchableOpacity
      style={[
        styles.filterTypeChip,
        activeFilterType === type ? styles.activeFilterTypeChip : null
      ]}
      onPress={() => {
        setActiveFilterType(type);
        setActiveFilter('Todos');
      }}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={activeFilterType === type ? 'white' : '#666'} 
        style={styles.filterTypeIcon}
      />
      <Text 
        style={[
          styles.filterTypeText,
          activeFilterType === type ? styles.activeFilterTypeText : null
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar miembro..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Type Selection */}
      <View style={styles.filterTypeContainer}>
        {renderFilterTypeChip('cargo', 'Cargo', 'briefcase-outline')}
        {renderFilterTypeChip('equipo', 'Equipo', 'people-outline')}
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={getFilterCategories()}
          renderItem={({ item }) => renderFilterChip(item)}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Members List */}
      <FlatList
        data={filteredMiembros}
        renderItem={renderMiembro}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#70d7c7']}
            tintColor="#70d7c7"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No se encontraron miembros</Text>
          </View>
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
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    elevation: 1,
  },
  activeFilterChip: {
    backgroundColor: '#70d7c7',
  },
  filterChipText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  miembroCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  miembroInfo: {
    flex: 1,
  },
  nombreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 4,
  },
  detalleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#70d7c7',
  },
  photoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#70d7c7',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  familyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  familyIcon: {
    marginRight: 4,
  },
  familyText: {
    fontSize: 12,
    color: '#70d7c7',
    fontStyle: 'italic',
  },
});

export default ListaMiembrosScreen;