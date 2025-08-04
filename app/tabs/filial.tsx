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
import { useFilial } from './contexts/filialContext';

export default function FilialScreen() {
  const { setFilialSelecionada } = useFilial();
  const router = useRouter();

  const empresas = [
    {
      title: '001 LEMOS E MARQUES IND.',
      data: ['003: Rio Grande do Norte', 'Filial A2', 'Filial A3'],
    },
    {
      title: '002 LEMOS E MARQUES COM.',
      data: ['Filial B1', 'Filial B2'],
    },
    {
      title: '003 LEMOS E MARQUES DIST.',
      data: ['Filial C1'],
    },
  ];

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }, []);
  
    if (loading) return <SkeletonNotas />;

  return (
    <View style={{ flex: 1 }}>
      {/*<StatusBar backgroundColor="#093C85" barStyle="light-content" />*/}

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Olá Rigoberto o/</Text>
      </View>

      <View style={styles.container}>

        {/* Título */}
        <View style={{alignItems: 'center' }}>
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
    //elevation: 4,
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
