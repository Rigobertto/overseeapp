import api from '@/app/services/api';
import { useFilial } from '@/app/tabs/contexts/filialContext';
import { useUsuario } from '@/app/tabs/contexts/usuarioContext';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export type ItemEntrada = {
  id: number;
  nome: string;
  codigo: string;
  quantidade: number;
};

type Props = {
  visible: boolean;
  item?: ItemEntrada | null;
  nrNFent: string;
  onCancel: () => void;
  onUpdated?: (resp: any) => void;
};

export default function ItemCheckModal({ visible, item, nrNFent, onCancel, onUpdated }: Props) {
  const [quantidadeChecada, setQuantidadeChecada] = useState('1');
  const { filialSelecionada } = useFilial();   // ex.: "070"
  const { usuarioSelecionada } = useUsuario(); // deve ter cd_usu (ex.: "008")

  useEffect(() => {
    if (visible) setQuantidadeChecada('1');
  }, [visible, item?.id]);

  const incrementar = () => {
    const atual = parseInt(quantidadeChecada || '0', 10) || 0;
    const limite = item?.quantidade ?? Number.MAX_SAFE_INTEGER;
    const prox = Math.min(atual + 1, limite);
    setQuantidadeChecada(String(prox));
  };

  const decrementar = () => {
    const atual = parseInt(quantidadeChecada || '0', 10) || 0;
    const prox = Math.max(atual - 1, 0);
    setQuantidadeChecada(String(prox));
  };

  const confirmar = async () => {
    try {
      if (!item?.id) {
        Alert.alert('Ops', 'Item inválido.');
        return;
      }
      if (!filialSelecionada || !nrNFent) {
        Alert.alert('Ops', 'Filial ou número da nota de saída não informados.');
        return;
      }
      const qtd = parseInt(quantidadeChecada || '0', 10);
      if (Number.isNaN(qtd) || qtd < 0) {
        Alert.alert('Ops', 'Quantidade inválida.');
        return;
      }

      const body = {
        cd_fil: String(filialSelecionada.cd_fil), 
        nr_nfent: String(nrNFent),
        cd_usu_check: String(usuarioSelecionada?.cd_usu ?? ''), 
        sn_check: qtd > 0 ? '1' : '0',
        qt_check: String(qtd),
        
      };
      console.log('Atualizando item', item.id, 'com', body);

      const url = `/nfentradas/itens/${item.id}`;
      //const params = { cd_fil: String(filialSelecionada), nr_nf: String(nrNF) };
      const resp = await api.patch(url, body);


      onUpdated?.(resp.data);
      onCancel();
    } catch (error: any) {
      console.error('Erro ao atualizar item', error?.response?.data || error?.message);
      const msg = error?.response?.data?.message || 'Não foi possível atualizar o item.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitulo}>Checar item</Text>

          {item && (
            <>
              <Text style={styles.modalItemNome}>
                {item.nome} ({item.codigo})
              </Text>
              <Text style={styles.modalInfo}>Disponível: {item.quantidade}</Text>

              <View style={styles.qtdRow}>
                <TouchableOpacity style={styles.qtdBtn} onPress={decrementar}>
                  <Text style={styles.qtdBtnText}>–</Text>
                </TouchableOpacity>

                <TextInput
                  value={quantidadeChecada}
                  onChangeText={setQuantidadeChecada}
                  keyboardType="number-pad"
                  style={styles.qtdInput}
                  placeholder="0"
                />

                <TouchableOpacity style={styles.qtdBtn} onPress={incrementar}>
                  <Text style={styles.qtdBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.cancelar]} onPress={onCancel}>
                  <Text style={styles.actionText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.confirmar]} onPress={confirmar}>
                  <Text style={[styles.actionText, { color: '#fff' }]}>OK</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#093C85',
    marginBottom: 8,
  },
  modalItemNome: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  modalInfo: { fontSize: 14, color: '#555', marginBottom: 12 },
  qtdRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qtdBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  qtdBtnText: { fontSize: 18, fontWeight: '700' },
  qtdInput: {
    marginHorizontal: 12, minWidth: 70, textAlign: 'center',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, fontSize: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  cancelar: { backgroundColor: '#eee' },
  confirmar: { backgroundColor: '#093C85' },
  actionText: { fontWeight: '700' },
});
