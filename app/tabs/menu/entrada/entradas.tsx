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

const notasMock = [
  { id: '1', nome: 'Lemos e Marques', numero: '20250001', valor: 299.90 },
  { id: '2', nome: 'Singularity LTDA', numero: '20250002', valor: 149.99 },
  { id: '3', nome: 'Casa & Construção', numero: '20250003', valor: 899.00 },
  { id: '4', nome: 'Supermercado Atacadão', numero: '20250004', valor: 1299.00 },
  { id: '5', nome: 'Amazon LTDA', numero: '20250005', valor: 359.90 },
];

export default function EntradasScreen() {

  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [notas, setNotas] = useState(notasMock);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) return <SkeletonNotas />;

  const filtrarNotas = () => {
    const resultado = notasMock.filter(p =>
      p.nome.toLowerCase().includes(busca.toLowerCase().trim())
    );
    setNotas(resultado);
    Keyboard.dismiss(); // fecha o teclado após buscar
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/tabs/menu/entrada/itens/itensEntradas',
                  params: {
                    numero: item.numero,
                    nome: item.nome,
                    valor: item.valor.toFixed(2),
                  },
                });
              }}
          >
            <View style={styles.notasCard}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.numero}>{item.numero}</Text>
              <Text style={styles.valor}>R$ {item.valor.toFixed(2)}</Text>
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
