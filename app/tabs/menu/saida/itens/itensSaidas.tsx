import SkeletonNotas from '@/app/components/loading';
import api from '@/app/services/api';
import { useFilial } from '@/app/tabs/contexts/filialContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function ItensSaidasScreen() {

 const { filialSelecionada } = useFilial();

  const { nr_nf, cd_cli, nm_cli } = useLocalSearchParams();
  const [busca, setBusca] = useState('');
  const [notas, setNotas] = useState<any[]>([]);
  const [notasFiltradas, setNotasFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItensSaidas = async () => {
      const url = `/nfsaidas/itens/?cd_fil=${filialSelecionada?.cd_fil}&nr_nf=${nr_nf}`;
      try {
        const response = await api.get(url);
        const dadosFormatados = response.data.map((item: any) => ({
          id: item.id,
          nome: item.nm_mat,
          codigo: item.cd_mat,
          quantidade: item.qt_prod,
          barcode: item.cd_gtin,
        }));
        setNotas(dadosFormatados);
        setNotasFiltradas(dadosFormatados); // inicializa também a lista exibida
      } catch (error) {
        console.error("Erro ao buscar itens em: " + url, error);
      } finally {
        setLoading(false);
      }
    };

    if (filialSelecionada && nr_nf) {
      fetchItensSaidas();
    }
  }, [filialSelecionada, nr_nf]);

  const filtrarProdutos = (texto: string) => {
    const termo = texto.toLowerCase().trim();

    if (!termo) {
      setNotasFiltradas(notas);
      return;
    }

    const resultado = notas.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo) ||
      p.barcode.toLowerCase().includes(termo)
    );

    setNotasFiltradas(resultado);
  };


  if (loading) {
    return <SkeletonNotas />;
  }

  return (
      <View style={styles.container}>
        {/* Título */}
        <View style={{ marginBottom: 16, alignItems: 'center'}}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
            {nm_cli} - {nr_nf}
          </Text>
        </View>
        
        {/* Campo de Busca */}
        <View style={styles.buscaContainer}>
          <TextInput
            style={styles.input}
            placeholder="Código, nome ou barras..."
            value={busca}
            onChangeText={(texto) => {
              setBusca(texto);
              filtrarProdutos(texto); // filtra em tempo real
            }}
          />
        </View>
  
        {/* Lista */}
        <FlatList
          data={notasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => 
            <View style={styles.produtoCard}>
              <Text style={styles.nome}>{item.nome} - {item.codigo}</Text>
              <Text style={styles.quantidade}>Quantidade: {item.quantidade}</Text>
  
              <View style={styles.codigo}>
                <FontAwesome6 name="barcode" size={20} color="black" />
                <Text style={styles.barcode}>{item.barcode}</Text>           
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.nenhumResultado}>Nenhum material encontrado.</Text>
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

  produtoCard: {
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
  codigo: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 8,
    fontSize: 14,
    color: '#444',
  },

  barcode: {
    backgroundColor: '#F8AD6D',
    borderRadius: 8,
    padding: 3,
  },

  barcodeVerde: {
    backgroundColor: '#0A7C36', // verde
    borderRadius: 8,
    padding: 3,
  },

  quantidade: {
    marginTop: 4,
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
