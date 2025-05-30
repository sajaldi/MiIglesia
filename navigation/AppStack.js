import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import DetalleDiaServicioScreen from '../screens/DetalleDiaServicioScreen';
import AgregarObservacionesScreen from '../screens/AgregarObservacionesScreen';
import ListaAsistenciaScreen from '../screens/ListaAsistenciaScreen';
import SeleccionarChecklistScreen from '../screens/SeleccionarChecklistScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Inicio' }}
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
        name="ListaAsistencia" 
        component={ListaAsistenciaScreen}
        options={{ title: 'Lista de Asistencia' }}
      />
      <Stack.Screen 
        name="SeleccionarChecklist" 
        component={SeleccionarChecklistScreen}
        options={{ title: 'Seleccionar Checklist' }}
      />
    </Stack.Navigator>
  );
}