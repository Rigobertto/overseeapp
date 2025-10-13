import SkeletonNotas from '@/app/components/loading';
import api from '@/app/services/api';
import { useFilial } from '@/app/tabs/contexts/filialContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ItemCheckModal, { ItemEntrada } from './checagemItensEntradas';

type ItemEntradaAPI = {
  id: number;
  nm_mat: string;
  cd_mat: string;
  qt_prod: number;
  cd_gtin?: string | null;
  sn_check?: number | string; // 0/1 do backend (se vier)
};

export default function ItensEntradasScreen() {
const { filialSelecionada } = useFilial();

  const { nr_nfent, cd_forn, nm_forn } = useLocalSearchParams();
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<(ItemEntrada & { barcode?: string; sn_check?: 0 | 1 })[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<ItemEntrada & { barcode?: string; sn_check?: 0 | 1 } | null>(null);

  const itensChecados = useMemo(() => {
    const s = new Set<number>();
    itens.forEach((i) => {
      if (Number(i.sn_check) === 1) s.add(i.id);
    });
    return s;
  }, [itens]);

  const carregarItens = async () => {
    if (!filialSelecionada?.cd_fil || !nr_nfent) return;
    const url = `/nfentradas/itens?cd_fil=${filialSelecionada.cd_fil}&nr_nfent=${nr_nfent}`;
    try {
      setLoading(true);
      const response = await api.get<ItemEntradaAPI[]>(url);
      const dados = response.data.map((r) => ({
        id: r.id,
        nome: r.nm_mat,
        codigo: r.cd_mat,
        quantidade: r.qt_prod,
        barcode: r.cd_gtin ?? undefined,
        sn_check: (typeof r.sn_check === 'string' ? parseInt(r.sn_check, 10) : r.sn_check) as 0 | 1 | undefined,
      }));
      setItens(dados);
    } catch (error) {
      console.error('Erro ao buscar itens em: ' + url, error);
      Alert.alert('Erro', 'Não foi possível carregar os itens da NF de Saída.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarItens();
    
  }, [filialSelecionada?.cd_fil, nr_nfent]);

  const itensFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return itens;
    return itens.filter((p) =>
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      (p.barcode ?? '').toLowerCase().includes(termo),
    );
  }, [busca, itens]);

  const filtrarProdutos = () => {
    Keyboard.dismiss();
  };

  const abrirModal = (item: any) => {
    // Se o item já estiver checado, bloqueia a abertura do modal
    if (Number(item.sn_check) === 1) {
      Alert.alert('Item já checado', 'Este item já foi conferido e não pode ser reaberto.');
      return; // sai da função sem abrir o modal
    }

    setItemSelecionado(item);
    setModalVisivel(true);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setItemSelecionado(null);
  };

  
  const onUpdated = (resp: any) => {
    
    const atualizado = resp?.data;
    if (atualizado?.id) {
      setItens((prev) =>
        prev.map((n) =>
          n.id === atualizado.id
            ? {
                ...n,
                quantidade: atualizado.qt_check ?? n.quantidade,
                sn_check: Number(atualizado.sn_check) as 0 | 1,
              }
            : n,
        ),
      );
    } else {
      
      carregarItens();
    }
  };

  if (loading) {
    return <SkeletonNotas />;
  }


  return (
      <View style={styles.container}>
        {/* Título */}
        <View style={{ marginBottom: 16, alignItems: 'center'}}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
            {nm_forn} - {nr_nfent}
          </Text>
        </View>
        
            {/* Busca */}
            <View style={styles.buscaContainer}>
              <TextInput
                style={styles.input}
                placeholder="Código, nome ou barras..."
                value={busca}
                onChangeText={setBusca}
                returnKeyType="search"
                onSubmitEditing={filtrarProdutos}
              />
              <TouchableOpacity style={styles.botao} onPress={filtrarProdutos}>
                <Text style={styles.textoBotao}>Buscar</Text>
              </TouchableOpacity>
            </View>
      
            {/* Lista */}
            <FlatList
              data={itensFiltrados}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const checado = itensChecados.has(item.id);
                const isChecado = Number(item.sn_check) === 1;
                return (
                  <Pressable onPress={() => abrirModal(item)} disabled={isChecado}>
                    <View style={[styles.produtoCard, checado && { opacity: 0.8 }]}>
                      <Text style={styles.nome}>
                        {item.nome} - {item.codigo}
                      </Text>
      
                      <Text style={styles.quantidade}>Quantidade: {item.quantidade}</Text>
      
                      <View style={styles.codigo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <FontAwesome6 name="barcode" size={20} color="black" />
                          <Text style={[styles.barcode, checado && styles.barcodeVerde]}>{item.barcode || '—'}</Text>
                        </View>
                        {checado && <Text style={styles.etiquetaChecado}>CHECADO</Text>}
                      </View>
                    </View>
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text style={styles.nenhumResultado}>Nenhum material encontrado.</Text>}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
      
            {/* Modal de checagem */}
            <ItemCheckModal
              visible={modalVisivel}
              item={itemSelecionado ?? undefined}
              nrNFent={String(nr_nfent)}
              onCancel={fecharModal}
              onUpdated={onUpdated}
            />
      </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  buscaContainer: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 },
  botao: { backgroundColor: '#093C85', paddingHorizontal: 16, marginLeft: 8, justifyContent: 'center', borderRadius: 8 },
  textoBotao: { color: '#fff', fontWeight: 'bold' },

  produtoCard: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10, elevation: 2 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#093C85' },
  codigo: { justifyContent: 'space-between', flexDirection: 'row', marginTop: 8, alignItems: 'center' },

  barcode: { marginLeft: 8, backgroundColor: '#F8AD6D', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 6, overflow: 'hidden' },
  barcodeVerde: { backgroundColor: '#0A7C36', color: '#fff' },
  etiquetaChecado: { backgroundColor: '#0A7C36', color: '#fff', fontSize: 12, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, overflow: 'hidden' },

  quantidade: { marginTop: 4, fontSize: 15, fontWeight: '600' },
  separator: { height: 12 },
  nenhumResultado: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
});
