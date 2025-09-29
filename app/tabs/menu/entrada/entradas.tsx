import SkeletonNotas from '@/app/components/loading';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../../services/api';
import { useFilial } from '../../contexts/filialContext';

export default function EntradasScreen() {
  const { filialSelecionada } = useFilial();
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [notas, setNotas] = useState<any[]>([]);

  useEffect(() => {
    let ativo = true;

    const fetchEntradas = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/nfentradas/${filialSelecionada?.cd_fil}`);
        if (!ativo) return;
        const dadosFormatados = response.data.map((nfentrada: any) => ({
          nr_nfent: nfentrada.nr_nfent,
          cd_forn: nfentrada.cd_forn,
          dt_emis: nfentrada.dt_emis,
          vl_nota: nfentrada.vl_nota,
          nm_fil: nfentrada.nm_fil,
          nm_forn: nfentrada.nm_forn,
        }));
        setNotas(dadosFormatados);
      } catch (error) {
        console.error("Erro ao buscar entradas", error);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    fetchEntradas();

    return () => {
      ativo = false;
    };
  }, [filialSelecionada]);


  if (loading) return <SkeletonNotas />;

  const filtrarNotas = () => {
    const resultado = notas.filter(p =>
      p.nm_forn.toLowerCase().includes(busca.toLowerCase().trim())
    );
    setNotas(resultado);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center'}}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
          Notas de Entrada
        </Text>
      </View>

      {/* Campo de Busca */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar notas..."
          value={busca}
          onChangeText={setBusca}
        />
        <TouchableOpacity style={styles.botao} onPress={filtrarNotas}>
          <Text style={styles.textoBotao}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={notas}
        keyExtractor={(item) => String(item.nr_nfent)}
        renderItem={({ item }) => (

          <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/tabs/menu/entrada/itens/itensEntradas',
                  params: {
                    nr_nfent: item.nr_nfent,
                    cd_forn: item.cd_forn,
                    nm_forn: item.nm_forn,
                  },
                });
              }}
          >
            <View style={styles.notasCard}>
              <Text style={styles.nome}>{item.nm_forn} - {item.cd_forn}</Text>
              <Text style={styles.numero}>{new Date(item.dt_emis).toLocaleDateString("pt-BR")}</Text>
              <Text style={styles.valor}>
                {Number(item.vl_nota).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>

            </View>
          </TouchableOpacity>

        )}
        ListEmptyComponent={
          <Text style={styles.nenhumResultado}>Nenhuma nota de entrada encontrada.</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  buscaContainer: { flexDirection: 'row', marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  botao: {
    backgroundColor: '#093C85',
    paddingHorizontal: 16,
    marginLeft: 8,
    justifyContent: 'center',
    borderRadius: 8,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },

  notasCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#093C85',
  },
  numero: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
  valor: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
    //color: '#0A7C36',
  },
  separator: { height: 12 },
  nenhumResultado: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
