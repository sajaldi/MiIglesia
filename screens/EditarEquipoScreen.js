import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import ColorPicker from 'react-native-wheel-color-picker';
import { collection, getDocs } from 'firebase/firestore';

const EditarEquipoScreen = ({ route, navigation }) => {
  const { equipo } = route.params;
  const [nombre, setNombre] = useState(equipo.nombre);
  const [color, setColor] = useState(equipo.color || '#70d7c7');
  const [photoUri, setPhotoUri] = useState(equipo.photoUri);
  const [equipoMiembros, setEquipoMiembros] = useState(equipo.miembros || []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      const equipoRef = doc(db, 'equipos', equipo.id);
      const updateData = {
        nombre,
        color,
        updatedAt: new Date()
      };
      
      // Only include photoUri if it exists
      if (photoUri) {
        updateData.photoUri = photoUri;
      }

      await updateDoc(equipoRef, updateData);
      Alert.alert('Éxito', 'Equipo actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el equipo');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [miembros, setMiembros] = useState([]);
  const [filteredMiembros, setFilteredMiembros] = useState([]);

  useEffect(() => {
    cargarMiembros();
  }, []);

  useEffect(() => {
    const filtered = miembros.filter(miembro => 
      miembro.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      miembro.apellido?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMiembros(filtered);
  }, [searchQuery, miembros]);

  const cargarMiembros = async () => {
    try {
      const miembrosRef = collection(db, 'miembros');
      const querySnapshot = await getDocs(miembrosRef);
      const miembrosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMiembros(miembrosData);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleAddMember = async (miembro) => {
    try {
      const equipoRef = doc(db, 'equipos', equipo.id);
      if (!equipoMiembros.includes(miembro.id)) {
        const nuevosMiembros = [...equipoMiembros, miembro.id];
        await updateDoc(equipoRef, {
          miembros: nuevosMiembros
        });
        
        // Update local state instead of route.params
        setEquipoMiembros(nuevosMiembros);
        
        Alert.alert('Éxito', 'Miembro agregado al equipo');
      } else {
        Alert.alert('Info', 'Este miembro ya está en el equipo');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'No se pudo agregar el miembro');
    }
  };

  const renderMiembro = ({ item }) => {
    const isAdded = equipoMiembros.includes(item.id);
    return (
      <TouchableOpacity 
        style={[
          styles.miembroItem,
          isAdded && { backgroundColor: color + '20' }
        ]}
        onPress={() => handleAddMember(item)}
      >
        <Text style={[
          styles.miembroNombre,
          isAdded && { color: color }
        ]}>
          {item.nombre} {item.apellido}
        </Text>
        <Ionicons 
          name={isAdded ? "checkmark-circle" : "add-circle-outline"} 
          size={24} 
          color={isAdded ? color : "#70d7c7"} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.teamPhoto} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: color + '40' }]}>
              <Ionicons name="camera" size={40} color={color} />
              <Text style={styles.uploadText}>Subir foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nombre del Equipo</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del equipo"
        />

        <Text style={styles.label}>Color del Equipo</Text>
        <View style={styles.colorPickerContainer}>
          <ColorPicker
            color={color}
            onColorChange={setColor}
            thumbSize={40}
            sliderSize={40}
            noSnap={true}
            row={false}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>

        <View style={styles.searchSection}>
          <Text style={styles.label}>Agregar Miembros</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar miembros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredMiembros}
            renderItem={renderMiembro}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No se encontraron miembros</Text>
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at the bottom
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  teamPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4150',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  colorPickerContainer: {
    height: 300,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#70d7c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  miembroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  miembroNombre: {
    fontSize: 16,
    color: '#2d4150',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  }
});

export default EditarEquipoScreen;
