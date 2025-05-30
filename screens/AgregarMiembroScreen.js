// Remove these comment lines and duplicate imports
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Update these imports
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AgregarMiembroScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [imagenUri, setImagenUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !apellido) {
      Alert.alert('Error', 'Nombre y Apellido son obligatorios');
      return;
    }

    setIsLoading(true);
    
    try {
      // Assuming you have access to the current user's ID
      const currentUserId = global.currentUser?.uid;
      
      const docRef = await addDoc(collection(db, 'miembros'), {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        imagen: imageBase64,
        fechaCreacion: new Date(),
        userId: currentUserId // Associate the user ID
      });

      Alert.alert('Éxito', 'Miembro guardado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar el miembro');
    } finally {
      setIsLoading(false);
    }
  };

  // Update button component
  <TouchableOpacity 
    style={styles.button} 
    onPress={handleGuardar}
    disabled={isLoading}
  >
    <Text style={styles.buttonText}>
      {isLoading ? 'Guardando...' : 'Guardar Miembro'}
    </Text>
  </TouchableOpacity>
  const handleSeleccionarFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets) {
      setImagenUri(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agregar Nuevo Miembro</Text>
      
      {/* Photo Upload Section */}
      <TouchableOpacity style={styles.imageContainer} onPress={handleSeleccionarFoto}>
        {imagenUri ? (
          <Image source={{ uri: imagenUri }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>+ Agregar Foto</Text>
        )}
      </TouchableOpacity>
      
      {imagenUri && (
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => setImagenUri(null)}
        >
          <Text style={styles.removeButtonText}>Eliminar Foto</Text>
        </TouchableOpacity>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        multiline
      />
      
      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Miembro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholder: {
    color: '#666',
    textAlign: 'center',
  },
  removeButton: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  removeButtonText: {
    color: 'tomato',
    fontWeight: 'bold',
  },
});

export default AgregarMiembroScreen;