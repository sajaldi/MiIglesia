import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListaServiciosScreen from '../screens/ListaServiciosScreen';
import AgregarServicioScreen from '../screens/AgregarServicioScreen';
import DetalleServicioScreen from '../screens/DetalleServicioScreen';
import AgregarDiaServicioScreen from '../screens/AgregarDiaServicioScreen';
import EditarDiaServicioScreen from '../screens/EditarDiaServicioScreen';
import ListaAsistenciaScreen from '../screens/ListaAsistenciaScreen';
import DetalleDiaServicioScreen from '../screens/DetalleDiaServicioScreen';
import AgregarObservacionesScreen from '../screens/AgregarObservacionesScreen';
import EditarServicioScreen from '../screens/EditarServicioScreen';

const Stack = createStackNavigator();

export default function ServiciosStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListaServicios"
        component={ListaServiciosScreen}
        options={({ navigation }) => ({
          title: 'Servicios',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('AgregarServicio')}
            >
              <Ionicons name="add-outline" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="AgregarServicio" 
        component={AgregarServicioScreen}
        options={{ title: 'Agregar Servicio' }}
      />
      <Stack.Screen 
        name="DetalleServicio" 
        component={DetalleServicioScreen}
        options={({ route }) => ({
          title: route.params.servicio.nombre
        })}
      />
      <Stack.Screen 
        name="AgregarDiaServicio" 
        component={AgregarDiaServicioScreen}
        options={{ title: 'Agregar Día de Servicio' }}
      />
      <Stack.Screen 
        name="EditarDiaServicio" 
        component={EditarDiaServicioScreen}
        options={{ title: 'Editar Día de Servicio' }}
      />
      <Stack.Screen 
        name="ListaAsistencia" 
        component={ListaAsistenciaScreen}
        options={{ title: 'Lista de Asistencia' }}
      />
      <Stack.Screen 
        name="DetalleDiaServicio" 
        component={DetalleDiaServicioScreen}
        options={{ title: 'Detalle del Día' }}
      />
      <Stack.Screen 
        name="AgregarObservaciones" 
        component={AgregarObservacionesScreen}
        options={{ title: 'Agregar Observaciones' }}
      />
      <Stack.Screen 
        name="EditarServicio" 
        component={EditarServicioScreen}
        options={{ title: 'Editar Servicio' }}
      />
    </Stack.Navigator>
  );
}