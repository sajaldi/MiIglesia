import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const DetalleMiembroScreen = ({ route, navigation }) => {
  const { miembro } = route.params;
  const [spouse, setSpouse] = React.useState(null);
  const [children, setChildren] = React.useState([]);
  const [siblings, setSiblings] = React.useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [userEmail, setUserEmail] = useState(miembro.email || '');

  React.useEffect(() => {
    loadFamilyMembers();
    console.log('Parents loaded:', parents); // Add this line
  }, [parents]); // Add parents to dependency array

  // Load siblings
  const [parents, setParents] = React.useState([]);

  const loadFamilyMembers = async () => {
    try {
      // Load parents
      const parentsData = [];
      if (miembro.padre) {
        const padreDoc = await getDoc(doc(db, 'miembros', miembro.padre));
        if (padreDoc.exists()) {
          const padreData = padreDoc.data();
          parentsData.push({ 
            id: padreDoc.id, 
            nombre: padreData.nombre,
            apellido: padreData.apellido,
            type: 'Padre' 
          });
        }
      }
      if (miembro.conyuge) {
        const spouseDoc = await getDoc(doc(db, 'miembros', miembro.conyuge));
        if (spouseDoc.exists()) {
          setSpouse({ id: spouseDoc.id, ...spouseDoc.data() });
        }
      } else {
        // Load parents when there's no spouse
        const parentsData = [];
        if (miembro.padre) {
          const padreDoc = await getDoc(doc(db, 'miembros', miembro.padre));
          if (padreDoc.exists()) {
            parentsData.push({ id: padreDoc.id, ...padreDoc.data(), type: 'Padre' });
          }
        }
        if (miembro.madre) {
          const madreDoc = await getDoc(doc(db, 'miembros', miembro.madre));
          if (madreDoc.exists()) {
            parentsData.push({ id: madreDoc.id, ...madreDoc.data(), type: 'Madre' });
          }
        }
        setParents(parentsData);
      }

      // Load children and update their parent reference
      if (miembro.hijos && miembro.hijos.length > 0) {
        const childrenData = await Promise.all(
          miembro.hijos.map(async (hijoId) => {
            const hijoDoc = await getDoc(doc(db, 'miembros', hijoId));
            if (hijoDoc.exists()) {
              const childData = { id: hijoDoc.id, ...hijoDoc.data() };
              
              // Update parent reference based on gender
              const updateData = {};
              if (miembro.genero === 'masculino') {
                updateData.padre = miembro.id;
                console.log(`Asignando padre automáticamente: ${miembro.nombre} ${miembro.apellido} a hijo/a: ${childData.nombre} ${childData.apellido}`);
              } else if (miembro.genero === 'femenino') {
                updateData.madre = miembro.id;
                console.log(`Asignando madre automáticamente: ${miembro.nombre} ${miembro.apellido} a hijo/a: ${childData.nombre} ${childData.apellido}`);
              }
              
              // Only update if needed
              if (Object.keys(updateData).length > 0) {
                await updateDoc(doc(db, 'miembros', hijoId), updateData);
              }
              
              return childData;
            }
            return null;
          })
        );
        setChildren(childrenData.filter(child => child !== null));
      }

      // Improved siblings logic
      try {
        const miembrosRef = collection(db, 'miembros');
        const querySnapshot = await getDocs(miembrosRef);
        const allMembers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Find siblings - members who share the same padre or madre
        const siblingsData = allMembers.filter(m => {
          // Don't include the current member
          if (m.id === miembro.id) return false;
          
          // Check if they share a father (and both have a father specified)
          const sharesFather = miembro.padre && m.padre && miembro.padre === m.padre;
          
          // Check if they share a mother (and both have a mother specified)
          const sharesMother = miembro.madre && m.madre && miembro.madre === m.madre;
          
          // Include if they share either parent
          return sharesFather || sharesMother;
        });
        
        console.log('Found siblings:', siblingsData.length);
        setSiblings(siblingsData);
      } catch (error) {
        console.error('Error loading siblings:', error);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const handlePhotoPress = async () => {
    if (global.userRole !== 'admin') return;

    Alert.alert(
      "Seleccionar foto",
      "¿Cómo deseas agregar la foto?",
      [
        {
          text: "Tomar foto",
          onPress: () => launchCamera()
        },
        {
          text: "Elegir de galería",
          onPress: () => launchGallery()
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para usar la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      navigation.navigate('EditarMiembro', { 
        miembro: { ...miembro, photoUri: result.assets[0].uri }
      });
    }
  };

  const launchGallery = async () => {
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
      navigation.navigate('EditarMiembro', { 
        miembro: { ...miembro, photoUri: result.assets[0].uri }
      });
    }
  };

  const associateWithUser = async () => {
    try {
      const miembroRef = doc(db, 'miembros', miembro.id);
      await updateDoc(miembroRef, {
        email: userEmail,
        updatedAt: new Date()
      });
      
      Alert.alert('Éxito', 'Email de usuario asociado correctamente');
      setModalVisible(false);
    } catch (error) {
      console.error('Error associating user email:', error);
      Alert.alert('Error', 'No se pudo asociar el email de usuario');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={handlePhotoPress} disabled={global.userRole !== 'admin'}>
          {miembro.photoUri ? (
            <Image 
              source={{ uri: miembro.photoUri }} 
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={50} color="#70d7c7" />
              {global.userRole === 'admin' && (
                <Text style={styles.photoText}>Toca para cambiar foto</Text>
              )}
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.nombre}>
            {miembro.nombre} {miembro.apellido}
          </Text>
          {global.userRole === 'admin' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditarMiembro', { miembro })}
            >
              <Ionicons name="pencil" size={24} color="#70d7c7" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoSection}>
          <InfoItem icon="call" label="Teléfono" value={miembro.telefono || 'No especificado'} miembro={miembro} />
          <InfoItem icon="mail" label="Email" value={miembro.email || 'No especificado'} miembro={miembro} />
          <InfoItem icon="location" label="Dirección" value={miembro.direccion || 'No especificada'} />
          <InfoItem icon="briefcase" label="Cargo" value={miembro.cargo || 'Sin cargo asignado'} />
          <InfoItem 
            icon="man" 
            label="Padre" 
            value={parents.find(p => p.type === 'Padre') ? 
              `${parents.find(p => p.type === 'Padre').nombre} ${parents.find(p => p.type === 'Padre').apellido}` : 
              'No especificado'} 
          />
          <InfoItem 
            icon="woman" 
            label="Madre" 
            value={parents.find(p => p.type === 'Madre')?.nombre + ' ' + parents.find(p => p.type === 'Madre')?.apellido || 'No especificado'} 
          />
        </View>

        {/* Family Section */}
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>Familia</Text>
          
          {spouse && (
            <View style={styles.spouseContainer}>
              <View style={styles.familyMember}>
                <Image 
                  source={{ uri: miembro.photoUri }} 
                  style={styles.familyPhoto}
                  defaultSource={require('../assets/default-avatar.png')}
                />
                <Text style={styles.familyName}>{miembro.nombre}</Text>
              </View>
              <Ionicons name="heart" size={24} color="#70d7c7" style={styles.heartIcon} />
              <View style={styles.familyMember}>
                <Image 
                  source={{ uri: spouse.photoUri }} 
                  style={styles.familyPhoto}
                  defaultSource={require('../assets/default-avatar.png')}
                />
                <Text style={styles.familyName}>{spouse.nombre}</Text>
              </View>
            </View>
          )}

          {children.length > 0 && (
            <View style={styles.childrenContainer}>
              <Text style={styles.childrenTitle}>Hijos</Text>
              <View style={styles.childrenGrid}>
                {children.map(child => (
                  <View key={child.id} style={styles.familyMember}>
                    <Image 
                      source={{ uri: child.photoUri }} 
                      style={styles.familyPhoto}
                      defaultSource={require('../assets/default-avatar.png')}
                    />
                    <Text style={styles.familyName}>{child.nombre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {siblings.length > 0 && (
            <View style={styles.siblingsContainer}>
              <Text style={styles.childrenTitle}>Hermanos</Text>
              <View style={styles.childrenGrid}>
                <View style={styles.familyMember}>
                  <Image 
                    source={{ uri: miembro.photoUri }} 
                    style={styles.familyPhoto}
                    defaultSource={require('../assets/default-avatar.png')}
                  />
                  <Text style={styles.familyName}>{miembro.nombre}</Text>
                </View>
                {siblings.map(sibling => (
                  <View key={sibling.id} style={styles.familyMember}>
                    <Image 
                      source={{ uri: sibling.photoUri }} 
                      style={styles.familyPhoto}
                      defaultSource={require('../assets/default-avatar.png')}
                    />
                    <Text style={styles.familyName}>{sibling.nombre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="person-add" size={20} color="white" />
        <Text style={styles.actionButtonText}>Asociar con Usuario</Text>
      </TouchableOpacity>
      
      {/* Email Association Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Asociar con Usuario</Text>
            <Text style={styles.modalText}>
              Ingrese el email del usuario para asociarlo con este miembro:
            </Text>
            <TextInput
              style={styles.modalInput}
              value={userEmail}
              onChangeText={setUserEmail}
              placeholder="Email del usuario"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={associateWithUser}
              >
                <Text style={styles.modalButtonText}>Asociar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value, miembro }) => {
  const openWhatsApp = (phoneNumber) => {
    const prefix = miembro.genero === 'masculino' ? 'Hermano' : 'Hermana';
    const message = `Bendiciones ${prefix} ${miembro.nombre}`;
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo');
        }
      })
      .catch(err => console.error('Error al abrir WhatsApp:', err));
  };

  return (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={20} color="#2d4150" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoValueContainer}>
        <Text style={styles.infoValue}>{value}</Text>
        {label === 'Teléfono' && value !== 'No especificado' && (
          <TouchableOpacity 
            onPress={() => openWhatsApp(value)}
            style={styles.whatsappButton}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  editButton: {
    padding: 8,
  },
  infoSection: {
    gap: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d4150',
    marginLeft: 28,
  },
  whatsappButton: {
    marginLeft: 10,
    padding: 5,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
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
    alignSelf: 'center',
    marginBottom: 20,
  },
  photoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#70d7c7',
  },
  familySection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 16,
  },
  spouseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  familyMember: {
    alignItems: 'center',
  },
  familyPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#70d7c7',
  },
  familyName: {
    fontSize: 14,
    color: '#2d4150',
  },
  heartIcon: {
    marginHorizontal: 16,
  },
  childrenContainer: {
    marginTop: 8,
  },
  childrenTitle: {
    fontSize: 16,
    color: '#2d4150',
    marginBottom: 12,
    fontWeight: '600',
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16,
  },
  siblingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  siblingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  siblingIcon: {
    marginHorizontal: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#70d7c7',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#70d7c7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    margin: 16,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DetalleMiembroScreen;