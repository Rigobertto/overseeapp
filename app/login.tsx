import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image
            source={require('../assets/images/logomarca.png')}
            style={{ width: 200, height: 72, marginBottom: 30,}}
          />
        </View>

      <View style={styles.credentials}>
        <Text style={styles.bemvindo}>Bem-vindo (a)</Text>

        {/* Campo de e-mail */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="account-circle" size={20} color="#093C85" style={styles.icon} />
          <TextInput
            inputMode="email"
            autoComplete="email"
            placeholder="Email"
            style={styles.input}
          />
        </View>

        {/* Campo de senha */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={20} color="#093C85" style={styles.icon} />
          <TextInput
            secureTextEntry={secure}
            placeholder="Senha"
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off' : 'eye'}
              size={20}
              color="#093C85"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

            {/* Esqueci minha senha e Lembre-se de mim */}
            {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? '#093C85' : undefined}
          />
          <Text style={styles.checkboxLabel}>Manter-me conectado</Text>
        </View>

        {/* Botão de Logar */}
        <View>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/tabs/filial')}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
        
      </View>
      
    </View>
    <View style={styles.footer}>
        <Text style={{ fontSize: 10, }}>Oversee V. 1.0 By Lemarq Software</Text>
        {/* <Image
            source={require('../assets/images/logo_lemarq.png')}
            style={{ }}
          /> */}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    //alignItems: 'center'
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    paddingTop: 20,
  },

  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    //width: '100%',
    height: 85,
    //backgroundColor: 'red',
  },

  credentials: {
    flex: 4,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
  },

  bemvindo: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#093C85',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#C7CCD6',
    width: 250,
    height: 40,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 8,
    fontSize: 16,
  },

  icon: {
    paddingHorizontal: 4,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },

  loginButton: {
    backgroundColor: '#093C85',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: 250,
    marginTop: 15,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footer: {
    flexDirection: 'row',
    marginTop: 15,
    paddingLeft: 20,
    alignItems: 'flex-end',
    //width: '80%',
    height: 40,
    //backgroundColor: 'red',
  },
});
