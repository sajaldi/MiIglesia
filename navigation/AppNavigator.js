import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ServiciosScreen from '../screens/ServiciosScreen';
import EditarServicioScreen from '../screens/EditarServicioScreen';
import EditarDiaServicioScreen from '../screens/EditarDiaServicioScreen';
import ListaAsistenciaScreen from '../screens/ListaAsistenciaScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen 
        name="Servicios" 
        component={ServiciosScreen} 
        options={{ title: 'Servicios' }}
      />
      <Stack.Screen 
        name="EditarServicio" 
        component={EditarServicioScreen} 
        options={{ title: 'Editar Servicio' }}
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
    </Stack.Navigator>
  );
};

export default AppNavigator;