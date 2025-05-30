import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListaEquiposScreen from '../screens/ListaEquiposScreen';
import AgregarEquipoScreen from '../screens/AgregarEquipoScreen';
import DetalleEquipoScreen from '../screens/DetalleEquipoScreen';

const Stack = createStackNavigator();

export default function EquiposStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListaEquipos"
        component={ListaEquiposScreen}
        options={({ navigation }) => ({
          title: 'Equipos',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('AgregarEquipo')}
            >
              <Ionicons name="add-outline" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="AgregarEquipo" 
        component={AgregarEquipoScreen}
        options={{ title: 'Agregar Equipo' }}
      />
      <Stack.Screen 
        name="DetalleEquipo" 
        component={DetalleEquipoScreen}
        options={({ route }) => ({
          title: route.params.equipo.nombre
        })}
      />
    </Stack.Navigator>
  );
}