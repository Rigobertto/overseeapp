import api from '@/app/services/api';
import { Feather, FontAwesome5, Fontisto, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  return (
    <>  
      <StatusBar  style="inverted" backgroundColor="transparent" translucent />

      <Drawer
          drawerContent={(props) => (
            <DrawerContentScrollView {...props}>
            {/* Título personalizado */}
              <View style={styles.header}>
                <Text style={styles.title}>Menu</Text>
              </View>

            {/* Itens padrão do Drawer */}
              <DrawerItemList {...props} />

             {/* Item de logout manual */}
            <DrawerItem
              label="Encerrar Sessão"
              activeTintColor="#093C85"
              inactiveTintColor="#093C85"
              icon={({ color, size }) => (
                <Feather name="log-out" size={size} color={color} />
              )}
              labelStyle={{ fontSize: 16 }}
              onPress={handleLogout}
            />

              </DrawerContentScrollView>
          )}

          screenOptions={{
            drawerStyle: {
              backgroundColor: '#f5f5f5',   // cor de fundo do drawer
              width: 260,
              //display: 'none',
              
            },
            drawerActiveTintColor: '#093C85', // cor do item ativo
            drawerInactiveTintColor: '#093C85',  // cor dos outros
            drawerLabelStyle: {
              fontSize: 16,
            },
            headerStyle: {
              backgroundColor: '#093C85',  // fundo do header
            },
            headerTintColor: '#fff',        // cor dos textos do header
            

        }}   
      >

          <Drawer.Screen
            name="entrada"
            options={{
              headerShown: false, // IMPORTANTE! Isso impede o header do Drawer nas telas internas
              drawerLabel: 'Notas de Entrada',
              drawerIcon: ({ color, size }) => (
                <FontAwesome5 name="box-open" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="saida"
            options={{
              headerShown: false, // IMPORTANTE! Isso impede o header do Drawer nas telas internas
              drawerLabel: 'Notas de Saída',
              drawerIcon: ({ color, size }) => (
                <FontAwesome5 name="box" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="requisicao"
            options={{
              headerShown: false, // IMPORTANTE! Isso impede o header do Drawer nas telas internas
              drawerLabel: 'Requisições',
              drawerIcon: ({ color, size }) => (
                <FontAwesome5 name="toolbox" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen name="suporte/suporte" 
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
                <TouchableOpacity
                  onPress={() => router.push('/tabs/filial')}
                  style={{ marginRight: 15 }}
                >
                  <Fontisto name="arrow-return-left" size={20} color="#fff" />
                </TouchableOpacity>
              ),
          
              headerStyle: {
                backgroundColor: '#093C85',
              },

              headerTintColor: '#fff',
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="support-agent" size={size} color={color} />
              ),
            }}
          />

          <Drawer.Screen
            name="entrada/itensEntradas"
            options={{
              drawerItemStyle: { display: 'none' }, // Oculta do Drawer
              //headerShown: false, // também esconde o header
              headerTitle: 'Itens da Nota de Entrada',
               headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15, marginRight: 10 }}>
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerStyle: {
                backgroundColor: '#093C85',
              },
              headerTintColor: '#fff',
              swipeEnabled: false, // Habilita o gesto de voltar
            }}
          />

          <Drawer.Screen
            name="requisicao/itensRequisicoes"
            options={{
              drawerItemStyle: { display: 'none' }, // Oculta do Drawer
              //headerShown: false, // também esconde o header
              headerTitle: 'Itens da Requisição',
               headerLeft: () => (
                <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15, marginRight: 10 }}>
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
              ),
              headerStyle: {
                backgroundColor: '#093C85',
              },
              headerTintColor: '#fff',
              swipeEnabled: false, // Habilita o gesto de voltar
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
