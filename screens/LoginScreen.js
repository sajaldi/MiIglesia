import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendPasswordResetEmail } from 'firebase/auth';  // Add this import at the top
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const handleBiometricAuth = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');

      if (!savedEmail || !savedPassword) {
        Alert.alert('Error', 'Primero debe iniciar sesión con email y contraseña');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación con huella digital',
        disableDeviceFallback: true,
      });

      if (result.success) {
        const userCredential = await signInWithEmailAndPassword(auth, savedEmail, savedPassword);
        const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          global.userRole = userData.rol;
          navigation.replace('MainApp');
        }
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      setError('Error en autenticación biométrica');
    }
  };

  const handleLoginSuccess = async (userCredential) => {
    console.log('Login successful:', userCredential.user);
    // After successful login, navigate to Welcome screen
    navigation.replace('Welcome');  // Using replace instead of navigate
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login attempt successful');
      await handleLoginSuccess(userCredential);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Error al iniciar sesión: ' + error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Correo enviado',
        'Se ha enviado un enlace para restablecer su contraseña a su correo electrónico'
      );
    } catch (error) {
      console.error('Error al enviar correo:', error);
      Alert.alert('Error', 'No se pudo enviar el correo de restablecimiento');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Iglesia de Cristo Monte Sion</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPasswordButton} 
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
      </TouchableOpacity>
      
      {isBiometricSupported && (
        <TouchableOpacity 
          style={styles.biometricButton} 
          onPress={handleBiometricAuth}
        >
          <Ionicons name="finger-print" size={24} color="white" />
          <Text style={styles.biometricButtonText}>
            Iniciar sesión con huella digital
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Add these new styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2d4150',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#70d7c7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  biometricButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  forgotPasswordButton: {
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#70d7c7',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;