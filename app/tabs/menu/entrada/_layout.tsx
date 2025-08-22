import { Fontisto } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { router, Stack } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFilial } from '../../contexts/filialContext';

export default function RequisicaoStackLayout() {

      const { filialSelecionada } = useFilial();
      const filialName = filialSelecionada
      ? `${filialSelecionada.cd_fil} - ${filialSelecionada.nm_fil}`
      : 'Menu';

  return (
    <Stack
      //screenOptions={{ headerShown: true}} 
      //initialRouteName="saidas"
    >

        <Stack.Screen
          name="entradas"
          options={{
            headerTitle: () => (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  maxWidth: 500,
                }}
                numberOfLines={2}
              >
                {filialName}
              </Text>
            ),
            headerLeft: () => (
              <View style={{ alignItems: 'flex-start', marginLeft: -10 }}>
                <DrawerToggleButton tintColor="#fff" />
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/tabs/filial')}
                style={{  }}
              >
                <Fontisto name="arrow-return-left" size={20} color="#fff" />
              </TouchableOpacity>
            ),
            headerStyle: { backgroundColor: '#093C85' },
            headerTintColor: '#fff',
          }}
        />

        <Stack.Screen
            name="itens/itensEntradas"
            options={{
                headerShown: true, // Ativa o header local da stack
                title: `Itens da Entrada`,
                headerStyle: { backgroundColor: '#093C85' },
                headerTintColor: '#fff',
            }}
            
        />
      
    </Stack>
  );
}
