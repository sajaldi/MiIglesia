import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ListaMiembrosScreen from '../screens/ListaMiembrosScreen';
import AgregarMiembroScreen from '../screens/AgregarMiembroScreen';
import EditarMiembroScreen from '../screens/EditarMiembroScreen';
import DetalleMiembroScreen from '../screens/DetalleMiembroScreen';

const Stack = createStackNavigator();

function MiembrosStackScreen() {
  return (
    <Stack.Navigator>
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
        options={({ route }) => ({
          title: route.params?.miembro ? `${route.params.miembro.nombre} ${route.params.miembro.apellido}` : 'Detalle Miembro'
        })}
      />
    </Stack.Navigator>
  );
}

export default MiembrosStackScreen;