import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// Remove this import since we won't use it
// import MiembrosStackScreen from './MiembrosStack';
import EquiposStackScreen from './EquiposStack';
import ServiciosStackScreen from './ServiciosStack';
import CalendarioStackScreen from './CalendarioStack';
import AdminStackScreen from './AdminStack';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Equipos') {
            iconName = focused ? 'hand-left-sharp' : 'hand-left-outline';
          } else if (route.name === 'Servicios') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Calendario') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Equipos"
        component={EquiposStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Servicios" 
        component={ServiciosStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Calendario" 
        component={CalendarioStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Admin" 
        component={AdminStackScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
