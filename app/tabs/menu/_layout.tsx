import api from '@/app/services/api';
import { Feather, FontAwesome5, Fontisto, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFilial } from '../contexts/filialContext';

async function handleLogout() {
  try {
    await api.post('/logout'); // token já vai no header
    await AsyncStorage.removeItem('authToken');
    router.replace('/login');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    await AsyncStorage.removeItem('authToken');
    router.replace('/login');
  }
}

export default function DrawerLayout() {
  const { filialSelecionada } = useFilial();
  const filialName = filialSelecionada
    ? `Filial ${filialSelecionada.cd_fil} - ${filialSelecionada.nm_fil}`
    : 'Menu';

  // Evita logout duplo
  const loggingOutRef = useRef(false);
  const confirmLogout = useCallback(() => {
    if (loggingOutRef.current) return;
    Alert.alert(
      'Encerrar sessão',
      'Deseja realmente sair e voltar para a tela de login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            if (loggingOutRef.current) return;
            loggingOutRef.current = true;
            try {
              await handleLogout();
            } finally {
              loggingOutRef.current = false;
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  return (
    <>
      <StatusBar style="inverted" backgroundColor="transparent" translucent />

      <Drawer
        drawerContent={(props) => (
          <DrawerContentScrollView {...props}>
            {/* Título personalizado */}
            <View style={styles.header}>
              <Text style={styles.title}>Menu</Text>
            </View>

            {/* Itens padrão do Drawer */}
            <DrawerItemList {...props} />

            {/* Item de logout com confirmação */}
            <DrawerItem
              label="Encerrar Sessão"
              activeTintColor="#093C85"
              inactiveTintColor="#093C85"
              icon={({ color, size }) => (
                <Feather name="log-out" size={size} color={color} />
              )}
              labelStyle={{ fontSize: 16 }}
              onPress={() => {
                props.navigation.closeDrawer(); // fecha o drawer primeiro
                confirmLogout();                // abre o alerta de confirmação
              }}
            />
          </DrawerContentScrollView>
        )}
        screenOptions={{
          drawerStyle: { backgroundColor: '#f5f5f5', width: 260 },
          drawerActiveTintColor: '#093C85',
          drawerInactiveTintColor: '#093C85',
          drawerLabelStyle: { fontSize: 16 },
          headerStyle: { backgroundColor: '#093C85' },
          headerTintColor: '#fff',
        }}
      >
        <Drawer.Screen
          name="entrada"
          options={{
            headerShown: false,
            drawerLabel: 'Notas de Entrada',
            drawerIcon: ({ color, size }) => <FontAwesome5 name="box-open" size={size} color={color} />,
          }}
        />

        <Drawer.Screen
          name="saida"
          options={{
            headerShown: false,
            drawerLabel: 'Notas de Saída',
            drawerIcon: ({ color, size }) => <FontAwesome5 name="box" size={size} color={color} />,
          }}
        />

        <Drawer.Screen
          name="requisicao"
          options={{
            headerShown: false,
            drawerLabel: 'Requisições',
            drawerIcon: ({ color, size }) => <FontAwesome5 name="toolbox" size={size} color={color} />,
          }}
        />

        <Drawer.Screen
          name="suporte/suporte"
          options={{
            headerShown: true,
            drawerLabel: 'Contate o Suporte',
            headerTitle: () => (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 15,
                  flexWrap: 'wrap',
                  maxWidth: 240,
                  fontWeight: 'bold',
                }}
                numberOfLines={2}
              >
                {filialName}
              </Text>
            ),
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push('/tabs/filial')} style={{ marginRight: 15 }}>
                <Fontisto name="arrow-return-left" size={20} color="#fff" />
              </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#093C85' },
            headerTintColor: '#fff',
            drawerIcon: ({ color, size }) => <MaterialIcons name="support-agent" size={size} color={color} />,
          }}
        />
      </Drawer>
    </>
  );
}

const styles = StyleSheet.create({
  
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#093C85',
  },
});
