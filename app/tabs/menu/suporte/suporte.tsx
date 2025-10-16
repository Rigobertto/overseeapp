import { Ionicons } from "@expo/vector-icons";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuporteScreen() {
  const email = "lemarq@lemarq.com.br";
  const telefone1 = "+55 (84) 3316-3070";
  const telefone2 = "+55 (84) 99637-8231";

  const handleEmail = () => {
    Linking.openURL(`mailto:${email}?subject=Suporte Oversee`);
  };

  const handlePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    Linking.openURL(`tel:${cleaned}`);
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Central de Suporte</Text>
      <Text style={styles.subtitle}>Entre em contato com nossa equipe</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>E-mail</Text>
        <TouchableOpacity style={styles.row} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={22} color="#093C85" />
          <Text style={styles.text}>{email}</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Telefones</Text>
        <TouchableOpacity style={styles.row} onPress={() => handlePhone(telefone1)}>
          <Ionicons name="call-outline" size={22} color="#093C85" />
          <Text style={styles.text}>{telefone1}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handlePhone(telefone2)}>
          <Ionicons name="call-outline" size={22} color="#093C85" />
          <Text style={styles.text}>{telefone2}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Atendimento de segunda a sexta, das 8h às 17h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#093C85",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 30,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#093C85",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  text: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});
