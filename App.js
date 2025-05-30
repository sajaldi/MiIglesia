import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MiembrosScreen from './screens/MiembrosScreen';
import EquiposScreen from './screens/EquiposScreen';
import ServiciosScreen from './screens/ServiciosScreen';
import CalendarioScreen from './screens/CalendarioScreen';
import AgregarMiembroScreen from './screens/AgregarMiembroScreen';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import ListaMiembrosScreen from './screens/ListaMiembrosScreen';
import AgregarEquipoScreen from './screens/AgregarEquipoScreen';
import ListaEquiposScreen from './screens/ListaEquiposScreen';
import EventoScreen from './screens/EventoScreen';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import EditarEquipoScreen from './screens/EditarEquipoScreen';
import { MenuProvider } from 'react-native-popup-menu';
import DetalleDiaServicioScreen from './screens/DetalleDiaServicioScreen';
import DetalleMiembroScreen from './screens/DetalleMiembroScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import EditarMiembroScreen from './screens/EditarMiembroScreen';




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
      {/* Add DetalleMiembro screen to MiembrosStack */}
      <Stack.Screen 
        name="DetalleMiembro" 
        component={DetalleMiembroScreen} 
        options={({ route }) => ({
          title: route.params?.miembro ? `${route.params.miembro.nombre} ${route.params.miembro.apellido}` : 'Detalle del Miembro'
        })}
      />
      {/* Add EditarMiembro screen if needed */}
      <Stack.Screen 
        name="EditarMiembro" 
        component={EditarMiembroScreen} 
        options={{ title: 'Editar Miembro' }}
      />
    </Stack.Navigator>
  );
}

// Add to your imports
import DetalleEquipoScreen from './screens/DetalleEquipoScreen';
import AgregarServicioScreen from './screens/AgregarServicioScreen';
import ListaServiciosScreen from './screens/ListaServiciosScreen';
import DetalleServicioScreen from './screens/DetalleServicioScreen';
// Add to your imports
import AdminScreen from './screens/AdminScreen';
import TiposServicioScreen from './screens/TiposServicioScreen';

function EquiposStackScreen() {
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
      <Stack.Screen 
        name="EditarEquipo" 
        component={EditarEquipoScreen}
        options={{ title: 'Editar Equipo' }}
      />
    </Stack.Navigator>
  );
}

// Add this new stack navigator function
// Add to your imports at the top
import AgregarDiaServicioScreen from './screens/AgregarDiaServicioScreen';

// Move AdminStackScreen outside and at the same level as other stack screens
function AdminStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminMenu"
        component={AdminScreen}
        options={{ title: 'Administración' }}
      />
      <Stack.Screen 
        name="TiposServicio" 
        component={TiposServicioScreen}
        options={{ title: 'Tipos de Servicio' }}
      />
    </Stack.Navigator>
  );
}

// Add to imports
import EditarDiaServicioScreen from './screens/EditarDiaServicioScreen';

// Add to imports at the top
import ListaAsistenciaScreen from './screens/ListaAsistenciaScreen';

function ServiciosStackScreen() {
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
      <Stack.Screen name="AgregarServicio" component={AgregarServicioScreen} />
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
        name="DetalleMiembro" 
        component={DetalleMiembroScreen} 
        options={{ title: 'Detalle del Miembro' }}
      />
    </Stack.Navigator>
  );
}

function CalendarioStackScreen() {
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

function MainStackScreen() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainApp" 
        component={MainApp} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function MainApp() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Miembros" 
        component={MiembrosStackScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Equipos" component={EquiposStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Servicios" component={ServiciosStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendario" component={CalendarioStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <NavigationContainer>
          <MainStackScreen />
        </NavigationContainer>
      </MenuProvider>
    </AuthProvider>
  );
}