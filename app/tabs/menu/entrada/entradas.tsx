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

export default function EntradasScreen() {
  const { filialSelecionada } = useFilial();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // busca (com debounce)
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const debounceRef = useRef<number | null>(null);

  // dados
  const [notasAll, setNotasAll] = useState<any[]>([]);
  const [notasFiltradas, setNotasFiltradas] = useState<any[]>([]);

  // Lock anti-duplo clique
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

  // Normaliza texto (remove acentos e deixa minúsculo)
  const norm = useCallback((s: any) => {
    if (s === null || s === undefined) return '';
    return String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }, []);

  const fetchEntradas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/nfentradas/${filialSelecionada?.cd_fil}`);
      const dadosFormatados = response.data.map((nfentrada: any) => ({
        nr_nfent: nfentrada.nr_nfent,
        cd_forn: nfentrada.cd_forn,
        dt_emis: nfentrada.dt_emis,
        vl_nota: nfentrada.vl_nota,
        nm_fil: nfentrada.nm_fil,
        nm_forn: nfentrada.nm_forn,
      }));
      setNotasAll(dadosFormatados);
      setNotasFiltradas(dadosFormatados); // mostra tudo no primeiro load
    } catch (error) {
      console.error('Erro ao buscar entradas', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filialSelecionada]);

  useEffect(() => {
    if (filialSelecionada) fetchEntradas();
  }, [filialSelecionada, fetchEntradas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEntradas();
  }, [fetchEntradas]);

  // Debounce da busca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setBuscaDebounced(busca), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busca]);

  // Filtra reativamente (nm_forn, cd_forn, nr_nfent)
  useEffect(() => {
    const q = norm(buscaDebounced);
    if (!q) {
      setNotasFiltradas(notasAll);
      return;
    }

    const isNumeric = /^\d+$/.test(q);

    const filtradas = notasAll.filter((p) => {
      const nome = norm(p.nm_forn);
      const codForn = norm(p.cd_forn);
      const nf = norm(p.nr_nfent);

      if (isNumeric) {
        // se digitou apenas números, tenta bater em nr_nfent OU cd_forn
        return nf.includes(q) || codForn.includes(q) || nome.includes(q);
      }
      // texto livre → bate em nome e também nos demais
      return nome.includes(q) || codForn.includes(q) || nf.includes(q);
    });

    setNotasFiltradas(filtradas);
  }, [buscaDebounced, notasAll, norm]);

  const isBusy = loading || refreshing;

  const abrirItens = useCallback(
    (item: any) => {
      if (isBusy || navLockRef.current) return;
      lockNavigation();
      Keyboard.dismiss();
      router.push({
        pathname: '/tabs/menu/entrada/itens/itensEntradas',
        params: {
          nr_nfent: String(item.nr_nfent),
          cd_forn: String(item.cd_forn),
          nm_forn: String(item.nm_forn),
        },
      });
    },
    [isBusy, lockNavigation]
  );

  const showSkeleton = loading && !refreshing;

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
          Notas de Entrada
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
          returnKeyType="search"
        />
        {/* Se quiser manter um botão de limpar: */}
        {/* <TouchableOpacity
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
          keyExtractor={(item) => String(item.nr_nfent)}
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
                  {item.nm_forn} - {item.cd_forn}
                </Text>
                <Text style={styles.numero}>
                  N° {item.nr_nfent} - {new Date(item.dt_emis).toLocaleDateString('pt-BR')}
                </Text>
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
            <Text style={styles.nenhumResultado}>
              Nenhuma nota de entrada encontrada.
            </Text>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Overlay durante o refresh */}
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
