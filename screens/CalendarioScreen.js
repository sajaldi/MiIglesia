import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'; // Agregar ScrollView
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';  // Agregar este import

// Configuración del calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom.','Lun.','Mar.','Mié.','Jue.','Vie.','Sáb.'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const CalendarioScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [servicios, setServicios] = useState([]);
  const [eventos, setEventos] = useState([]);  // Nuevo estado para eventos
  const [calendarView, setCalendarView] = useState('month');

  // Agregar función para cargar eventos
  const cargarEventos = async () => {
    try {
      const eventosRef = collection(db, 'eventos');
      const querySnapshot = await getDocs(eventosRef);
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Establecer a inicio del día
      
      const eventosData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(evento => {
          if (!evento.fecha) return false;
          const fechaEvento = evento.fecha.toDate();
          return fechaEvento >= hoy;
        })
        .sort((a, b) => a.fecha.toDate() - b.fecha.toDate());
      
      setEventos(eventosData);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  const handleDayPress = async (day) => {
    if (!day || !day.dateString) return;  // Validación adicional
    
    setSelectedDate(day.dateString);
    try {
      const serviciosRef = collection(db, 'servicios');
      const querySnapshot = await getDocs(serviciosRef);
      
      const serviciosData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(servicio => {
          if (!servicio.fechaInicio || !servicio.fechaFin) return false;
          
          const fechaServicioInicio = servicio.fechaInicio.toDate();
          const fechaServicioFin = servicio.fechaFin.toDate();
          const fechaSeleccionada = new Date(day.dateString);
          
          return fechaSeleccionada >= fechaServicioInicio && 
                 fechaSeleccionada <= fechaServicioFin;
        });

      console.log('Servicios encontrados:', serviciosData);
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setServicios([]);
    }
  };

  const getMarkedDates = () => {
    if (!selectedDate) return {};
    return {
      [selectedDate]: { selected: true, selectedColor: '#70d7c7' }
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.viewButtons}>
            <TouchableOpacity 
              style={[styles.viewButton, calendarView === 'month' && styles.activeButton]}
              onPress={() => setCalendarView('month')}
            >
              <Text style={styles.viewButtonText}>Mes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, calendarView === 'week' && styles.activeButton]}
              onPress={() => setCalendarView('week')}
            >
              <Text style={styles.viewButtonText}>Semana</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, calendarView === 'day' && styles.activeButton]}
              onPress={() => setCalendarView('day')}
            >
              <Text style={styles.viewButtonText}>Día</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('Evento', { fecha: selectedDate })}
          >
            <Ionicons name="add-circle" size={32} color="#70d7c7" />
          </TouchableOpacity>
        </View>

        <Calendar
          onDayPress={handleDayPress}
          current={selectedDate || undefined}
          calendarHeight={350}
          enableSwipeMonths={true}
          hideExtraDays={calendarView !== 'month'}
          markedDates={getMarkedDates()}
          style={styles.calendar}
        />

        {selectedDate && servicios.length > 0 && (
          <View style={styles.serviciosContainer}>
            <Text style={styles.serviciosTitle}>Servicios para {selectedDate}</Text>
            {servicios.map(servicio => (
              <Text key={servicio.id} style={styles.servicioText}>
                {servicio.tipo || 'Servicio sin tipo'}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.eventosContainer}>
          <Text style={styles.eventosTitle}>Próximos Eventos</Text>
          {eventos.length > 0 ? (
            eventos.map(evento => (
              <TouchableOpacity 
                key={evento.id}
                style={styles.eventoItem}
                onPress={() => navigation.navigate('Evento', { id: evento.id })}
              >
                <Text style={styles.eventoFecha}>
                  {evento.fecha.toDate().toLocaleDateString()}
                </Text>
                <View style={styles.eventoInfo}>
                  <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                  <Text style={styles.eventoHora}>
                    {evento.horaInicio.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventos}>No hay eventos próximos</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32, // Agregar padding extra al final
  },
  viewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  viewButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#70d7c7',
  },
  viewButtonText: {
    color: '#2d4150',
    fontWeight: '500',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  serviciosContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 16,
  },
  serviciosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d4150',
  },
  servicioText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#2d4150',
  },
  eventosContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 4,
  },
  eventosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 12,
  },
  eventoItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  eventoFecha: {
    backgroundColor: '#70d7c7',
    padding: 8,
    borderRadius: 6,
    color: '#fff',
    fontSize: 12,
    marginRight: 12,
  },
  eventoInfo: {
    flex: 1,
  },
  eventoTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d4150',
  },
  eventoHora: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noEventos: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
});

export default CalendarioScreen;