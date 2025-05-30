import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MiembrosStackScreen from '../navigation/MiembrosStackScreen';
import EquiposStackScreen from '../navigation/EquiposStackScreen';
import ServiciosStackScreen from '../navigation/ServiciosStackScreen';
import CalendarioStackScreen from '../navigation/CalendarioStackScreen';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Miembros') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Equipos') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Servicios') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Calendario') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#70d7c7',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Miembros" component={MiembrosStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Equipos" component={EquiposStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Servicios" component={ServiciosStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendario" component={CalendarioStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default MainApp;