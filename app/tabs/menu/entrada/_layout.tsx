import { Fontisto } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useFilial } from '../../contexts/filialContext';

export default function RequisicaoStackLayout() {
  const { filialSelecionada } = useFilial();
  const filialName = filialSelecionada
    ? `${filialSelecionada.cd_fil} - ${filialSelecionada.nm_fil}`
    : 'Menu';

  const { width } = useWindowDimensions();

  // Larguras “reservadas” para os lados do header (ícones/botões)
  const SIDE_RESERVED = 56;          // ~tamanho do botão + padding
  const TITLE_MAX = Math.max(0, width - SIDE_RESERVED * 2);

  return (
    <Stack>
      <Stack.Screen
        name="entradas"
        options={{
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View style={{ maxWidth: TITLE_MAX }}>
              <Text
                style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {filialName}
              </Text>
            </View>
          ),
          headerLeft: () => (
            <View /* reserva espaço “padrão” do lado esquerdo */ style={{ width: SIDE_RESERVED, alignItems: 'flex-start' }}>
              <DrawerToggleButton tintColor="#fff" />
            </View>
          ),
          headerRight: () => (
            <View /* reserva espaço fixo pro botão de retorno */ style={{ width: SIDE_RESERVED, alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => router.push('/tabs/filial')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ paddingHorizontal: 8 }}
              >
                <Fontisto name="arrow-return-left" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: { backgroundColor: '#093C85' },
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="itens/itensEntradas"
        options={{
          headerShown: true,
          title: 'Itens da Entrada',
          headerStyle: { backgroundColor: '#093C85' },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}
