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
  const [busca, setBusca] = useState('');
  const [notas, setNotas] = useState<any[]>([]);

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
      setNotas(dadosFormatados);
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

  const filtrarNotas = () => {
    const resultado = notas.filter((p) =>
      p.nm_forn.toLowerCase().includes(busca.toLowerCase().trim())
    );
    setNotas(resultado);
    Keyboard.dismiss();
  };

  const isBusy = loading || refreshing;

  // >>> DECLARE TODOS OS HOOKS ANTES DE QUALQUER RETURN <<<

  const abrirItens = useCallback(
    (item: any) => {
      if (isBusy || navLockRef.current) return;
      lockNavigation();
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

  // Nada de early-return aqui!
  const showSkeleton = loading && !refreshing;

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
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
          editable={!isBusy && !navLocked}
        />
        <TouchableOpacity
          style={styles.botao}
          onPress={filtrarNotas}
          disabled={isBusy || navLocked}
        >
          <Text style={styles.textoBotao}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      {showSkeleton ? (
        <SkeletonNotas />
      ) : (
        <FlatList
          data={notas}
          keyExtractor={(item) => String(item.nr_nfent)}
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
                  {new Date(item.dt_emis).toLocaleDateString('pt-BR')}
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
            <Text style={styles.nenhumResultado}>Nenhuma nota de entrada encontrada.</Text>
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
