import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const EditarMiembroScreen = ({ route, navigation }) => {
  const { miembro } = route.params;
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    ...miembro,
    genero: miembro.genero || '',
    padre: miembro.padre || ''  // Ensure padre is initialized
  });
  console.log('Initial memberData:', memberData); // Add initial state logging

  const [cargos, setCargos] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [photoUri, setPhotoUri] = useState(miembro.photoUri || null);
  const [selectedHijos, setSelectedHijos] = useState(miembro.hijos || []);

  useEffect(() => {
    loadCargos();
    loadMiembros();
  }, []);

  const loadCargos = async () => {
    try {
      const cargosRef = collection(db, 'tipoCargos');
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const newUri = await saveImage(result.assets[0].uri);
      setPhotoUri(newUri);
      setMemberData({ ...memberData, photoUri: newUri });
    }
  };

  const saveImage = async (uri) => {
    const fileName = `member_${miembro.id}_${Date.now()}.jpg`;
    const newUri = FileSystem.documentDirectory + fileName;
    
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: newUri
      });
      return newUri;
    } catch (error) {
      console.error('Error saving image:', error);
      return null;
    }
  };

  // Add this function
  const handleHijoToggle = (hijoId) => {
    setSelectedHijos(prevHijos => {
      if (prevHijos.includes(hijoId)) {
        return prevHijos.filter(id => id !== hijoId);
      } else {
        return [...prevHijos, hijoId];
      }
    });
  };

  const loadMiembros = async () => {
    try {
      const miembrosRef = collection(db, 'miembros');
      const querySnapshot = await getDocs(miembrosRef);
      const miembrosData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(m => m.id !== miembro.id); // Only exclude current member
      setMiembros(miembrosData);
    } catch (error) {
      console.error('Error loading miembros:', error);
    }
  };

  // Update handleUpdate to include conyuge
  const handleUpdate = async () => {
    try {
      const updateData = {};
      console.log('Current memberData:', memberData); // Add pre-update logging
      
      if (memberData.nombre) updateData.nombre = memberData.nombre;
      if (memberData.apellido) updateData.apellido = memberData.apellido;
      if (memberData.telefono) updateData.telefono = memberData.telefono;
      if (memberData.email) updateData.email = memberData.email;
      if (memberData.direccion) updateData.direccion = memberData.direccion;
      if (memberData.genero) updateData.genero = memberData.genero;
      if (memberData.cargo) updateData.cargo = memberData.cargo;
      updateData.padre = memberData.padre || null;
      console.log('Final updateData:', updateData); // Add final data logging
      if (memberData.madre !== undefined) updateData.madre = memberData.madre;
      if (selectedHijos.length > 0) updateData.hijos = selectedHijos;
      if (photoUri) updateData.photoUri = photoUri;

      // Handle parent-child relationships
      if (memberData.padre) {
        const padreRef = doc(db, 'miembros', memberData.padre);
        console.log('Updating father reference:', memberData.padre); // Added logging
        await updateDoc(padreRef, {
          hijos: arrayUnion(miembro.id)
        });
      }

      if (memberData.madre) {
        const madreRef = doc(db, 'miembros', memberData.madre);
        await updateDoc(madreRef, {
          hijos: arrayUnion(miembro.id)
        });
      }

      // Handle spouse relationship
      if (memberData.conyuge !== undefined) {
        updateData.conyuge = memberData.conyuge;
        
        // If there was a previous spouse, remove this member as their spouse
        if (miembro.conyuge && miembro.conyuge !== memberData.conyuge) {
          const prevSpouseRef = doc(db, 'miembros', miembro.conyuge);
          await updateDoc(prevSpouseRef, {
            conyuge: null
          });
        }

        // Update new spouse's reference if one is selected
        if (memberData.conyuge) {
          const spouseRef = doc(db, 'miembros', memberData.conyuge);
          await updateDoc(spouseRef, {
            conyuge: miembro.id
          });
        }
      }
      
      const miembroRef = doc(db, 'miembros', miembro.id);
      await updateDoc(miembroRef, updateData);
      
      Alert.alert('Éxito', 'Miembro actualizado correctamente');
      // Fix navigation to use the correct stack
      navigation.navigate('Miembros', {
        screen: 'ListaMiembros'
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el miembro');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={40} color="#70d7c7" />
              <Text style={styles.photoText}>Agregar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={memberData.nombre}
          onChangeText={(text) => setMemberData({...memberData, nombre: text})}
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          value={memberData.apellido}
          onChangeText={(text) => setMemberData({...memberData, apellido: text})}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={memberData.telefono}
          onChangeText={(text) => setMemberData({...memberData, telefono: text})}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={memberData.email}
          onChangeText={(text) => setMemberData({...memberData, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={memberData.direccion}
          onChangeText={(text) => setMemberData({...memberData, direccion: text})}
          multiline
        />

        <Text style={styles.label}>Género</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={memberData.genero}
            onValueChange={(itemValue) => setMemberData({...memberData, genero: itemValue})}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione género" value="" />
            <Picker.Item label="Masculino" value="masculino" />
            <Picker.Item label="Femenino" value="femenino" />
          </Picker>
        </View>

        <Text style={styles.label}>Padre</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={memberData.padre}
            onValueChange={(itemValue) => {
              console.log('Padre selected:', itemValue); // Add selection logging
              setMemberData({...memberData, padre: itemValue})
            }}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un padre" value="" />
            {miembros.filter(m => m.genero === 'masculino').map((m) => (
              <Picker.Item 
                key={m.id} 
                label={`${m.nombre} ${m.apellido}`} 
                value={m.id} 
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Madre</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={memberData.madre}
            onValueChange={(itemValue) => setMemberData({...memberData, madre: itemValue})}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione una madre" value="" />
            {miembros.filter(m => m.genero === 'femenino').map((m) => (
              <Picker.Item 
                key={m.id} 
                label={`${m.nombre} ${m.apellido}`} 
                value={m.id} 
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Cargo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={memberData.cargo}
            onValueChange={(itemValue) => setMemberData({...memberData, cargo: itemValue})}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un cargo" value="" />
            {cargos.map((cargo) => (
              <Picker.Item key={cargo.id} label={cargo.nombre} value={cargo.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Cónyuge</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={memberData.conyuge}
            onValueChange={(itemValue) => setMemberData({...memberData, conyuge: itemValue})}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un cónyuge" value="" />
            {miembros.map((m) => (
              <Picker.Item 
                key={m.id} 
                label={`${m.nombre} ${m.apellido}`} 
                value={m.id} 
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Hijos</Text>
        <View style={styles.hijosContainer}>
          {miembros.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.hijoItem,
                selectedHijos.includes(m.id) && styles.hijoItemSelected
              ]}
              onPress={() => handleHijoToggle(m.id)}
            >
              <Text style={[
                styles.hijoText,
                selectedHijos.includes(m.id) && styles.hijoTextSelected
              ]}>
                {m.nombre} {m.apellido}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#2d4150',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#70d7c7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#70d7c7',
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#70d7c7',
    borderStyle: 'dashed',
  },
  photoText: {
    marginTop: 8,
    color: '#70d7c7',
    fontSize: 16,
  },
  hijosContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  hijoItem: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    backgroundColor: '#f0f0f0',
  },
  hijoItemSelected: {
    backgroundColor: '#70d7c7',
  },
  hijoText: {
    fontSize: 16,
    color: '#2d4150',
  },
  hijoTextSelected: {
    color: 'white',
  },
});

  const handleSubmit = async () => {
    try {
      const miembroRef = doc(db, 'miembros', miembro.id);
      await updateDoc(miembroRef, {
        ...formData,
        email: user.email, // Associate with current user's email
        userId: user.uid,  // Store the user ID
        updatedAt: new Date()
      });

      Alert.alert('Éxito', 'Miembro actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating member:', error);
      Alert.alert('Error', 'Error al actualizar el miembro');
    }
  };

export default EditarMiembroScreen;
