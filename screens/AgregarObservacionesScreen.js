import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Observacion from '../models/Observacion';
import { auth } from '../config/firebase';

const AgregarObservacionesScreen = ({ route, navigation }) => {
  const { diaServicioId } = route.params;
  const currentUser = auth.currentUser;
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      }
    })();
  }, []);

  const tomarFoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const newPhoto = {
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
        };
        setFotos([...fotos, newPhoto]);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const guardarObservacion = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingrese una descripción');
      return;
    }

    try {
      const fotosBase64 = fotos.map(foto => ({
        data: foto.base64,
        uri: foto.uri
      }));

      await Observacion.create({
        diaServicioId,
        descripcion,
        fotos: fotosBase64,
        miembroId: currentUser.uid,
        miembroNombre: currentUser.displayName || currentUser.email,
      });
      
      Alert.alert('Éxito', 'Observación guardada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error al guardar observación:', error);
      Alert.alert('Error', 'No se pudo guardar la observación');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Descripción de la observación"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.photoButton} onPress={tomarFoto}>
        <Text style={styles.photoButtonText}>Tomar Foto</Text>
      </TouchableOpacity>

      <View style={styles.photoGrid}>
        {fotos.map((foto, index) => (
          <Image
            key={index}
            source={{ uri: foto.uri }}
            style={styles.photoThumbnail}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={guardarObservacion}
      >
        <Text style={styles.saveButtonText}>Guardar Observación</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    backgroundColor: '#34495e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AgregarObservacionesScreen;