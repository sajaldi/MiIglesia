import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Observacion from '../models/Observacion';
import Checklist from '../models/Checklist';
import ChecklistItem from '../models/ChecklistItem';
import ChecklistDiaServicio from '../models/ChecklistDiaServicio';

const ObservacionItem = ({ observacion }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpansion = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 500], // Adjust max height as needed
  });

  return (
    <TouchableOpacity onPress={toggleExpansion}>
      <Animated.View style={[styles.observacionCard, { maxHeight }]}>
        <View style={styles.observacionHeader}>
          <Text style={styles.observacionMeta}>
            Por: {observacion.miembroNombre} - {new Date(observacion.fechaCreacion.seconds * 1000).toLocaleDateString()}
          </Text>
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#7f8c8d" 
          />
        </View>
        
        <Text numberOfLines={expanded ? undefined : 2} style={styles.observacionText}>
          {observacion.descripcion}
        </Text>
        
        {expanded && observacion.fotos && observacion.fotos.length > 0 && (
          <ScrollView horizontal style={styles.fotosContainer}>
            {observacion.fotos.map((foto, fotoIndex) => (
              <Image
                key={fotoIndex}
                source={{ uri: `data:image/jpeg;base64,${foto.data}` }}
                style={styles.observacionFoto}
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const DetalleDiaServicioScreen = ({ route, navigation }) => {
  const { diaServicio } = route.params;
  const [observaciones, setObservaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [availableChecklists, setAvailableChecklists] = useState([]);
  const [checklistDiaItems, setChecklistDiaItems] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);

  useEffect(() => {
    cargarObservaciones();
    cargarChecklistDiaItems();
    cargarChecklist();
  }, []);

  const cargarChecklistDiaItems = async () => {
    try {
      const items = await ChecklistDiaServicio.getByDiaServicio(diaServicio.id);
      setChecklistDiaItems(items);
    } catch (error) {
      console.error('Error al cargar checklist items:', error);
    }
  };

  const loadAvailableChecklists = async () => {
    try {
      const checklists = await Checklist.getAll();
      setAvailableChecklists(checklists);
      setModalVisible(true);
    } catch (error) {
      console.error('Error loading checklists:', error);
    }
  };

  const handleSelectChecklistFromModal = async (selectedChecklist) => {
    try {
      const items = await ChecklistItem.getByChecklist(selectedChecklist.id);
      const checklistDiaItems = await ChecklistDiaServicio.createFromChecklist(
        diaServicio.id,
        selectedChecklist.id,
        items
      );
      setChecklistDiaItems(checklistDiaItems);
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating checklist items:', error);
      Alert.alert('Error', 'No se pudo crear la checklist para este día');
    }
  };

  const cargarChecklist = async () => {
    try {
      if (diaServicio.checklistId) {
        const checklists = await Checklist.getByDiaServicio(diaServicio.id);
        if (checklists.length > 0) {
          setChecklist(checklists[0]);
          const items = await ChecklistItem.getByChecklist(checklists[0].id);
          setChecklistItems(items);
        }
      }
    } catch (error) {
      console.error('Error al cargar checklist:', error);
    }
  };

  const handleSelectChecklist = async () => {
    try {
      navigation.navigate('SeleccionarChecklist', {
        diaServicioId: diaServicio.id,
        onSelect: async (selectedChecklist) => {
          await diaServicio.update({ checklistId: selectedChecklist.id });
          setChecklist(selectedChecklist);
          const items = await ChecklistItem.getByChecklist(selectedChecklist.id);
          setChecklistItems(items);
        }
      });
    } catch (error) {
      console.error('Error al seleccionar checklist:', error);
      Alert.alert('Error', 'No se pudo seleccionar el checklist');
    }
  };

  const toggleItemCompletado = async (item) => {
    try {
      await item.toggleCompletado();
      const updatedItems = checklistItems.map(i => 
        i.id === item.id ? { ...i, completado: !i.completado } : i
      );
      setChecklistItems(updatedItems);
    } catch (error) {
      console.error('Error al actualizar item:', error);
      Alert.alert('Error', 'No se pudo actualizar el item');
    }
  };

  const cargarObservaciones = async () => {
    try {
      const obs = await Observacion.getByDiaServicio(diaServicio.id);
      setObservaciones(obs);
    } catch (error) {
      console.error('Error al cargar observaciones:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Detalle del Día de Servicio</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{formatDate(diaServicio.fecha)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>{diaServicio.hora}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Tipo de Servicio:</Text>
          <Text style={styles.value}>{diaServicio.tipoServicioId}</Text>
        </View>

        {observaciones.length > 0 && (
          <View style={styles.observacionesSection}>
            <Text style={styles.sectionTitle}>Observaciones ({observaciones.length})</Text>
            {observaciones.map((obs) => (
              <ObservacionItem key={obs.id} observacion={obs} />
            ))}
          </View>
        )}

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('AgregarObservaciones', { 
              diaServicioId: diaServicio.id 
            })}
          >
            <Ionicons name="create-outline" size={24} color="white" />
            <Text style={styles.menuButtonText}>Agregar Observaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('ListaAsistencia', { 
              diaServicio: {
                ...diaServicio,
                servicioId: diaServicio.servicioId,
                id: diaServicio.id,
                fecha: diaServicio.fecha,
                tipoServicioId: diaServicio.tipoServicioId
              }
            })}
          >
            <Ionicons name="list-outline" size={24} color="white" />
            <Text style={styles.menuButtonText}>Ver Lista de Asistencia</Text>
          </TouchableOpacity>
        </View>

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Checklist</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditingChecklist(!isEditingChecklist)}
            >
              <Ionicons 
                name={isEditingChecklist ? "checkmark-circle" : "create-outline"} 
                size={24} 
                color={isEditingChecklist ? "#2ecc71" : "#3498db"} 
              />
            </TouchableOpacity>
          </View>
        
          {checklistDiaItems.length === 0 ? (
            <TouchableOpacity 
              style={styles.selectChecklistButton}
              onPress={loadAvailableChecklists}
            >
              <Ionicons name="add-circle-outline" size={24} color="#3498db" />
              <Text style={styles.selectChecklistText}>Seleccionar Checklist</Text>
            </TouchableOpacity>
          ) : (
            <View>
              {checklistDiaItems.map((item) => (
                <View key={item.id} style={styles.checklistItem}>
                  <TouchableOpacity 
                    onPress={async () => {
                      if (!isEditingChecklist) return;
                      await item.update({ completado: !item.completado });
                      setChecklistDiaItems(
                        checklistDiaItems.map(i => 
                          i.id === item.id ? { ...i, completado: !i.completado } : i
                        )
                      );
                    }}
                    disabled={!isEditingChecklist}
                  >
                    <Ionicons 
                      name={item.completado ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={item.completado ? "#2ecc71" : "#7f8c8d"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.itemDesc}>{item.descripcion}</Text>
                  <TextInput
                    style={[
                      styles.itemObservacion,
                      isEditingChecklist && styles.editableObservacion
                    ]}
                    placeholder="Observación"
                    value={item.observacion}
                    editable={isEditingChecklist}
                    onChangeText={async (text) => {
                      await item.update({ observacion: text });
                      setChecklistDiaItems(
                        checklistDiaItems.map(i => 
                          i.id === item.id ? { ...i, observacion: text } : i
                        )
                      );
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Seleccionar Checklist</Text>
            <ScrollView style={styles.checklistList}>
              {availableChecklists.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.checklistOption}
                  onPress={() => handleSelectChecklistFromModal(item)}
                >
                  <Text style={styles.checklistOptionText}>{item.nombre}</Text>
                  <Text style={styles.checklistOptionDesc}>{item.descripcion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  detailRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },
  menuSection: {
    marginTop: 30,
    gap: 15,
  },
  menuButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  observacionesSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  observacionCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  observacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  observacionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  observacionMeta: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  fotosContainer: {
    marginTop: 15,
  },
  observacionFoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  checklistSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  selectChecklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  selectChecklistText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  checklistItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#7f8c8d',
  },
});

export default DetalleDiaServicioScreen;