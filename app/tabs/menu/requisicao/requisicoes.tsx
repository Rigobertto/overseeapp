import SkeletonNotas from '@/app/components/loading';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../../services/api';
import { useFilial } from '../../contexts/filialContext';

export default function RequisicoesScreen() {
  const { filialSelecionada } = useFilial();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState('');
  const [notas, setNotas] = useState<any[]>([]);

  const fetchRequisicoes = useCallback(async () => {
    setLoading(true);
    const url = api.defaults.baseURL + `/requisicoes/${filialSelecionada?.cd_fil}`;
    try {
      const response = await api.get(`/requisicoes/${filialSelecionada?.cd_fil}`);
      const dadosFormatados = response.data.map((requisicao: any) => ({
        id: requisicao.nr_mov,
        nr_mov: requisicao.nr_mov,
        dt_mov: requisicao.dt_mov,
        nm_custo: requisicao.nm_custo,
      }));
      setNotas(dadosFormatados);
    } catch (error) {
      console.error('Erro ao buscar requisições em: ' + url, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filialSelecionada]);

  useEffect(() => {
    if (filialSelecionada) fetchRequisicoes();
  }, [filialSelecionada, fetchRequisicoes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequisicoes();
  }, [fetchRequisicoes]);

  // skeleton apenas no primeiro load
  if (loading && !refreshing) return <SkeletonNotas />;

  const filtrarNotas = () => {
    const resultado = notas.filter(p =>
      p.nm_custo.toLowerCase().includes(busca.toLowerCase().trim())
    );
    setNotas(resultado);
    Keyboard.dismiss();
  };

  const isBusy = loading || refreshing;

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center'}}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
          Requisições de Materiais
        </Text>
      </View>

      {/* Campo de Busca */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por centro de custo..."
          value={busca}
          onChangeText={setBusca}
          editable={!isBusy}
        />
        <TouchableOpacity style={styles.botao} onPress={filtrarNotas} disabled={isBusy}>
          <Text style={styles.textoBotao}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={notas}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={!isBusy}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#093C85']}
            tintColor="#093C85"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={isBusy}
            activeOpacity={isBusy ? 1 : 0.7}
            onPress={() => {
              router.push({
                pathname: '/tabs/menu/requisicao/itens/itensRequisicoes',
                params: {
                  nr_mov: item.nr_mov,
                  dt_mov: item.dt_mov,
                  nm_custo: item.nm_custo,
                },
              });
            }}
          >
            <View style={styles.notasCard}>
              <Text style={styles.nome}>{item.nm_custo}</Text>
              <Text style={styles.numero}>N° {item.nr_mov}</Text>
              <Text style={styles.valor}>{new Date(item.dt_mov).toLocaleDateString('pt-BR')}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.nenhumResultado}>Nenhuma requisição de material encontrada.</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Blur + overlay que intercepta toques (apenas durante o refresh) */}
      {refreshing && (
        <>
          <BlurView intensity={40} tint="dark" style={styles.blurOverlay} />
          <Pressable style={styles.blocker} onPress={() => {}}>
            <View style={styles.inlineLoader}>
              <ActivityIndicator size="large" color="#093C85" />
              <Text style={styles.inlineText}>Atualizando...</Text>
            </View>
          </Pressable>
        </>
      )}
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
  textoBotao: { color: '#fff', fontWeight: 'bold' },

  notasCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#093C85' },
  numero: { marginTop: 4, fontSize: 14, color: '#444' },
  valor: { marginTop: 8, fontSize: 15, fontWeight: '600' },

  separator: { height: 12 },
  nenhumResultado: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },

  // Desfoque ocupando a tela toda (abaixo do Pressable)
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 19,
  },

  // Overlay bloqueador (acima do blur) + loader
  blocker: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.001)', // transparente, só para capturar toques
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineLoader: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  inlineText: {
    marginTop: 8,
    fontWeight: '600',
    color: '#093C85',
    textAlign: 'center',
  },
});
