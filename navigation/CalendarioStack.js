import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalendarioScreen from '../screens/CalendarioScreen';
import EventoScreen from '../screens/EventoScreen';

const Stack = createStackNavigator();

export default function CalendarioStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CalendarioMain"
        component={CalendarioScreen}
        options={{ title: 'Calendario' }}
      />
      <Stack.Screen 
        name="Evento" 
        component={EventoScreen}
        options={{
          title: 'Nuevo Evento',
          headerStyle: {
            backgroundColor: '#70d7c7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}