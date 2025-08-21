import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SkeletonNotas from '../components/loading';
import api from '../services/api';
import { useFilial } from './contexts/filialContext';

export default function FilialScreen() {
  const { setFilialSelecionada } = useFilial();
  const router = useRouter();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresas = async () => {
      const url = api.defaults.baseURL + "/empresas";
      //console.log("Chamando URL:", url);
      try {
        const response = await api.get("/empresas"); // coloque a URL da sua API aqui
        // Transformando o retorno da API para o formato do SectionList
        //console.log(api.get("/empresas"));
        const dadosFormatados = response.data.map(empresa => ({
          title: empresa.nm_emp,
          data: empresa.filiais.map(filial => `${filial.cd_fil}: ${filial.nm_fil}`)
        }));
        setEmpresas(dadosFormatados);
      } catch (error) {
        console.error("Chamando URL:" + url, error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);

  if (loading) return <SkeletonNotas />;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Olá Rigoberto o/</Text>
      </View>

      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Selecione a Filial</Text>
        </View>

        <SectionList
          sections={empresas}
          keyExtractor={(item, index) => item + index}
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
                <Text style={styles.filialText}>{item}</Text>
                <Feather name="chevron-right" size={24} color="#093C85" style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
          )}
        />
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
