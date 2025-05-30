import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminScreen from '../screens/AdminScreen';
import TiposServicioScreen from '../screens/TiposServicioScreen';
import TipoCargoScreen from '../screens/TipoCargoScreen';
import ListaMiembrosScreen from '../screens/ListaMiembrosScreen';
import AgregarMiembroScreen from '../screens/AgregarMiembroScreen';
import EditarMiembroScreen from '../screens/EditarMiembroScreen';
import DetalleMiembroScreen from '../screens/DetalleMiembroScreen';
import ListaEquiposScreen from '../screens/ListaEquiposScreen';
import AgregarEquipoScreen from '../screens/AgregarEquipoScreen';
import EditarEquipoScreen from '../screens/EditarEquipoScreen';
import DetalleEquipoScreen from '../screens/DetalleEquipoScreen';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChecklistsScreen from '../screens/admin/ChecklistsScreen';
import AgregarChecklistScreen from '../screens/admin/AgregarChecklistScreen';
import EditarChecklistScreen from '../screens/admin/EditarChecklistScreen';

const Stack = createStackNavigator();

export default function AdminStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminMenu"
        component={AdminScreen}
        options={{ title: 'Administración' }}
      />
      <Stack.Screen
        name="TipoCargo"
        component={TipoCargoScreen}
        options={{ title: 'Tipo de Cargo' }}
      />
      <Stack.Screen 
        name="TiposServicio" 
        component={TiposServicioScreen}
        options={{ title: 'Tipos de Servicio' }}
      />
      <Stack.Screen 
        name="ListaMiembros"
        component={ListaMiembrosScreen}
        options={({ navigation }) => ({
          title: 'Miembros',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('AgregarMiembro')}
            >
              <Ionicons name="person-add-outline" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen 
        name="AgregarMiembro"
        component={AgregarMiembroScreen}
        options={{ title: 'Agregar Miembro' }}
      />
      <Stack.Screen 
        name="EditarMiembro"
        component={EditarMiembroScreen}
        options={{ title: 'Editar Miembro' }}
      />
      <Stack.Screen 
        name="DetalleMiembro"
        component={DetalleMiembroScreen}
        options={{ title: 'Detalle del Miembro' }}
      />
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
        name="EditarEquipo"
        component={EditarEquipoScreen}
        options={{ title: 'Editar Equipo' }}
      />
      <Stack.Screen 
        name="DetalleEquipo"
        component={DetalleEquipoScreen}
        options={({ route }) => ({
          title: route.params.equipo.nombre
        })}
      />
      <Stack.Screen 
        name="Checklists" 
        component={ChecklistsScreen}
        options={{ title: 'Checklists' }}
      />
      <Stack.Screen 
        name="AgregarChecklist" 
        component={AgregarChecklistScreen}
        options={{ title: 'Nueva Checklist' }}
      />
      <Stack.Screen 
        name="EditarChecklist" 
        component={EditarChecklistScreen}
        options={{ title: 'Editar Checklist' }}
      />
    </Stack.Navigator>
  );
}