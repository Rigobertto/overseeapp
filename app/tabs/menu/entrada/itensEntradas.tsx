import { FontAwesome6 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';

const produtosMock = [
  { id: '1', nome: 'Moto G22', codigo: '20250001', quantidade: 10.5, barcode: '123456789012' },
  { id: '2', nome: 'Iphone 16 Pro Max Plus Advanced Blaster Master', codigo: '20250002', quantidade: 15, barcode: '123456789012' },
  { id: '3', nome: 'Teclado Multilaser', codigo: '20250003', quantidade: 80, barcode: '123456789012' },
];

export default function ItensEntradasScreen() {

  const { numero, nome, valor } = useLocalSearchParams();
  const [busca, setBusca] = useState('');
  const [notas, setProdutos] = useState(produtosMock);

  const filtrarProdutos = () => {
    const resultado = produtosMock.filter(p =>
      p.nome.toLowerCase().includes(busca.toLowerCase().trim())
    );
    setProdutos(resultado);
    Keyboard.dismiss(); // fecha o teclado após buscar
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={{ marginBottom: 16, alignItems: 'center'}}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#093C85' }}>
          {nome} - {numero}
        </Text>
      </View>
      
      {/* Campo de Busca */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar produtos..."
          value={busca}
          onChangeText={setBusca}
        />
        <TouchableOpacity style={styles.botao} onPress={filtrarProdutos}>
          <Text style={styles.textoBotao}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => 
          <View style={styles.produtoCard}>

            <Text style={styles.nome}>{item.nome} - {item.codigo}</Text>
            <Text style={styles.quantidade}>Quantidade: {item.quantidade}</Text>

            <View style={styles.codigo}>
              <FontAwesome6 name="barcode" size={20} color="black" />
              <Text style={[styles.barcode]}>
                {item.barcode}
              </Text>           
            </View>
          </View>
          
        }
        ListEmptyComponent={
          <Text style={styles.nenhumResultado}>Nenhum produto da nota entrada encontrado.</Text>
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
