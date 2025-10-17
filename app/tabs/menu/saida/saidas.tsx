import SkeletonNotas from '@/app/components/loading';
import api from '@/app/services/api';
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
import { useFilial } from '../../contexts/filialContext';

export default function SaidasScreen() {
  const { filialSelecionada } = useFilial();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Busca com debounce
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dados
  const [notasAll, setNotasAll] = useState<any[]>([]);
  const [notasFiltradas, setNotasFiltradas] = useState<any[]>([]);

  // --- LOCK anti-duplo clique ---
  const [navLocked, setNavLocked] = useState(false);
  const navLockRef = useRef(false);
  const lockNavigation = useCallback(() => {
    navLockRef.current = true;
    setNavLocked(true);
    setTimeout(() => {
      navLockRef.current = false;
      setNavLocked(false);
    }, 800); // ajuste se preferir
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

  const fetchSaidas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/nfsaidas/${filialSelecionada?.cd_fil}`);
      const dadosFormatados = response.data.map((nfentrada: any) => ({
        nr_nf: nfentrada.nr_nf,
        cd_cli: nfentrada.cd_cli,
        dt_emis: nfentrada.dt_emis,
        dt_saida: nfentrada.dt_saida,
        vl_nf: nfentrada.vl_nf,
        nm_fil: nfentrada.nm_fil,
        nm_cli: nfentrada.nm_cli,
      }));
      setNotasAll(dadosFormatados);
      setNotasFiltradas(dadosFormatados);
    } catch (error) {
      console.error('Erro ao buscar saidas', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filialSelecionada]);

  useEffect(() => {
    if (filialSelecionada) fetchSaidas();
  }, [filialSelecionada, fetchSaidas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSaidas();
  }, [fetchSaidas]);

  // Debounce da busca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setBuscaDebounced(busca), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busca]);

  // Filtro reativo: nm_cli, cd_cli, nr_nf
  useEffect(() => {
    const q = norm(buscaDebounced);
    if (!q) {
      setNotasFiltradas(notasAll);
      return;
    }
    const isNumeric = /^\d+$/.test(q);

    const filtradas = notasAll.filter((p) => {
      const nome = norm(p.nm_cli);
      const codigo = norm(p.cd_cli);
      const nf = norm(p.nr_nf);
      // Se o usuário digitou só números, tenta bater primeiro em nr_nf/cd_cli, mas mantém busca no nome
      return isNumeric
        ? nf.includes(q) || codigo.includes(q) || nome.includes(q)
        : nome.includes(q) || codigo.includes(q) || nf.includes(q);
    });

    setNotasFiltradas(filtradas);
  }, [buscaDebounced, notasAll, norm]);

  const isBusy = loading || refreshing;
  const showSkeleton = loading && !refreshing;

  // Navegação segura (respeita busy/lock)
  const abrirItens = useCallback(
    (item: any) => {
      if (isBusy || navLockRef.current) return;
      lockNavigation();
      Keyboard.dismiss();
      router.push({
        pathname: '/tabs/menu/saida/itens/itensSaidas',
        params: {
          nr_nf: String(item.nr_nf),
          cd_cli: String(item.cd_cli),
          nm_cli: String(item.nm_cli),
        },
      });
    },
    [isBusy, lockNavigation]
  );

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
          Notas de Saída
        </Text>
      </View>

      {/* Campo de Busca (live search) */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome / CNPJ / CPF / Nº da nota..."
          value={busca}
          onChangeText={setBusca}
          editable={!isBusy && !navLocked}
          keyboardType="default"
          returnKeyType="search"
        />
        {/* Botão opcional (ex.: limpar)
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
          data={notasFiltradas}
          keyExtractor={(item) => String(item.nr_nf)}
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
                <Text style={styles.nome}>
                  {item.nm_cli} - {item.cd_cli}
                </Text>
                <Text style={styles.numero}>
                  N° {item.nr_nf} - {new Date(item.dt_emis).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.valor}>
                  {Number(item.vl_nf).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.nenhumResultado}>Nenhuma nota de saida encontrada.</Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Desfoque + overlay que intercepta toques (apenas durante o refresh) */}
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
