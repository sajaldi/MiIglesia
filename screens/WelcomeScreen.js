import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

const WelcomeScreen = ({ navigation }) => {
  const [memberName, setMemberName] = useState('');
  const auth = getAuth();
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const loadMemberData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const miembrosRef = collection(db, 'miembros');
          const q = query(miembrosRef, where('email', '==', user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const memberData = querySnapshot.docs[0].data();
            setMemberName(`${memberData.nombre} ${memberData.apellido}`);
          }
          
          // Start fade out animation after 2 seconds
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }).start(() => {
              navigation.replace('MainApp');
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Error loading member data:', error);
      }
    };

    loadMemberData();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.welcomeText}>
        {memberName ? `¡Bienvenido, ${memberName}!` : '¡Bienvenido!'}
      </Text>
      <Text style={styles.subtitle}>
        Que Dios le de muchas bendiciones este día
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WelcomeScreen;