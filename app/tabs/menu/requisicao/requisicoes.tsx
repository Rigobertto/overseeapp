import SkeletonNotas from '@/app/components/loading';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

  // Busca + debounce
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dados
  const [requisicoesAll, setRequisicoesAll] = useState<any[]>([]);
  const [requisicoesFiltradas, setRequisicoesFiltradas] = useState<any[]>([]);

  // --- LOCK anti-duplo clique ---
  const [navLocked, setNavLocked] = useState(false);
  const navLockRef = useRef(false);
  const lockNavigation = useCallback(() => {
    navLockRef.current = true;
    setNavLocked(true);
    setTimeout(() => {
      navLockRef.current = false;
      setNavLocked(false);
    }, 800);
  }, []);

  // Normaliza texto (remove acentos e minúsculas)
  const norm = useCallback((s: any) => {
    if (s === null || s === undefined) return '';
    return String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }, []);

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
      setRequisicoesAll(dadosFormatados);
      setRequisicoesFiltradas(dadosFormatados);
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

  // Debounce da busca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setBuscaDebounced(busca), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busca]);

  // Filtro reativo: nr_mov (numérico) ou nm_custo (texto)
  useEffect(() => {
    const q = norm(buscaDebounced);
    if (!q) {
      setRequisicoesFiltradas(requisicoesAll);
      return;
    }
    const isNumeric = /^\d+$/.test(q);

    const filtradas = requisicoesAll.filter((p) => {
      const nome = norm(p.nm_custo);
      const numero = norm(p.nr_mov);
      // Se digitou apenas números, prioriza número da requisição, mas ainda busca no nome
      return isNumeric ? numero.includes(q) || nome.includes(q) : nome.includes(q) || numero.includes(q);
    });

    setRequisicoesFiltradas(filtradas);
  }, [buscaDebounced, requisicoesAll, norm]);

  const isBusy = loading || refreshing;
  const showSkeleton = loading && !refreshing;

  // Navegação segura (respeita busy/lock)
  const abrirItens = useCallback((item: any) => {
    if (isBusy || navLockRef.current) return;
    lockNavigation();
    Keyboard.dismiss();
    router.push({
      pathname: '/tabs/menu/requisicao/itens/itensRequisicoes',
      params: {
        nr_mov: String(item.nr_mov),
        dt_mov: String(item.dt_mov),
        nm_custo: String(item.nm_custo),
      },
    });
  }, [isBusy, lockNavigation]);

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center'}}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
          Requisições de Materiais
        </Text>
      </View>

      {/* Campo de Busca (live search) */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nº da requisição / Centro de custo"
          value={busca}
          onChangeText={setBusca}
          editable={!isBusy && !navLocked}
          keyboardType="default"
          returnKeyType="search"
        />
        {/* Botão opcional de limpar
        <TouchableOpacity
          style={styles.botao}
          onPress={() => setBusca('')}
          disabled={isBusy || navLocked || !busca}
        >
          <Text style={styles.textoBotao}>Limpar</Text>
        </TouchableOpacity> */}
      </View>

      {/* Conteúdo */}
      {showSkeleton ? (
        <SkeletonNotas />
      ) : (
        <FlatList
          data={requisicoesFiltradas}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isBusy && !navLocked}
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
              disabled={isBusy || navLocked}
              activeOpacity={isBusy || navLocked ? 1 : 0.7}
              onPress={() => abrirItens(item)}
            >
              <View style={styles.notasCard}>
                <Text style={styles.nome}>{item.nm_custo}</Text>
                <Text style={styles.numero}>N° {item.nr_mov}</Text>
                <Text style={styles.valor}>
                  {new Date(item.dt_mov).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.nenhumResultado}>Nenhuma requisição de material encontrada.</Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

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
