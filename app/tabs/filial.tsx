import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SkeletonNotas from '../components/loading';
import api from '../services/api';
import { useFilial } from './contexts/filialContext';
import { useUsuario } from './contexts/usuarioContext';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // se usar token

export default function FilialScreen() {
  const { setFilialSelecionada } = useFilial();
  const { usuarioSelecionada /*, setUsuarioSelecionada */ } = useUsuario();
  const router = useRouter();

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const usuarioName = usuarioSelecionada
    ? `Olá  ${usuarioSelecionada.nome} o/`
    : 'Olá o/';

  // Logout
  const doLogout = useCallback(async () => {
    try {
      // await AsyncStorage.removeItem('token');
      // setUsuarioSelecionada?.(null);
      setFilialSelecionada(null);
      // delete api.defaults.headers.common['Authorization'];
    } finally {
      router.replace('/'); // ajuste pra sua rota de login (ex.: '/login')
    }
  }, [router, setFilialSelecionada]);

  const confirmExit = useCallback(() => {
    Alert.alert(
      'Sair',
      'Deseja sair e voltar à tela de login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, sair', style: 'destructive', onPress: doLogout },
      ],
      { cancelable: true }
    );
  }, [doLogout]);

  // Só Android hardware back
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        confirmExit();
        return true; // bloqueia o comportamento padrão (navegar pra trás)
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [confirmExit])
  );

  // Fetch dos dados
  useEffect(() => {
    const fetchEmpresas = async () => {
      const url = api.defaults.baseURL + '/empresas';
      try {
        const response = await api.get('/empresas');
        const dadosFormatados = response.data.map((empresa: any) => ({
          title: empresa.nm_emp,
          data: empresa.filiais.map((filial: any) => ({
            cd_fil: filial.cd_fil,
            nm_fil: filial.nm_fil,
          })),
        }));
        setEmpresas(dadosFormatados);
      } catch (error) {
        console.error('Chamando URL:' + url, error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresas();
  }, []);

  const showSkeleton = loading && empresas.length === 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{usuarioName}</Text>
      </View>

      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Selecione a Filial</Text>
        </View>

        {showSkeleton ? (
          <SkeletonNotas />
        ) : (
          <SectionList
            sections={empresas}
            keyExtractor={(item, index) => `${item.cd_fil}-${index}`}
            style={{ marginTop: 10 }}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.empresa}>{title}</Text>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setFilialSelecionada(item);
                  router.push('/tabs/menu/entrada/entradas');
                }}
              >
                <View style={styles.filial}>
                  <Text style={styles.filialText}>
                    {item.cd_fil}: {item.nm_fil}
                  </Text>
                  <Feather
                    name="chevron-right"
                    size={24}
                    color="#093C85"
                    style={{ marginLeft: 'auto' }}
                  />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
                Nenhuma empresa/filial encontrada.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#093C85',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: StatusBar.currentHeight || 0,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: '#093C85',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  empresa: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#093C85',
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  filial: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  filialText: {
    fontSize: 14,
    color: '#333',
  },
});
