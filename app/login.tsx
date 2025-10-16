import api from '@/app/services/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUsuario } from './tabs/contexts/usuarioContext';

const BUTTON_WIDTH = 250;
const BUTTON_HEIGHT = 44;

export default function LoginScreen() {
  const { setUsuarioSelecionada } = useUsuario();
  const [secure, setSecure] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Animações do botão
  const widthAnim = useRef(new Animated.Value(BUTTON_WIDTH)).current;
  const scalePress = useRef(new Animated.Value(1)).current;
  const radiusAnim = useRef(new Animated.Value(8)).current; // borda arredondada

  function animateToLoading() {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: BUTTON_HEIGHT,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(radiusAnim, {
        toValue: BUTTON_HEIGHT / 2,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }

  function animateToIdle() {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: BUTTON_WIDTH,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(radiusAnim, {
        toValue: 8,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }

  async function handleLogin() {
    // impede cliques repetidos
    if (loading) return;

    setLoading(true);
    animateToLoading();

    try {
      const response = await api.post('/login', { email, senha });

      if (response.data?.token) {
        const token = response.data.token;
        const usuario = {
          cd_usu: response.data.cd_usu,
          nome: response.data.nome,
        };

        setUsuarioSelecionada(usuario);
        await AsyncStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        router.replace('/tabs/filial');
        // não precisamos reverter a animação; a tela vai navegar
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao tentar logar. Verifique suas credenciais.');
      setLoading(false);
      animateToIdle();
    }
  }

  const onPressIn = () => {
    if (loading) return;
    Animated.spring(scalePress, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  };

  const onPressOut = () => {
    if (loading) return;
    Animated.spring(scalePress, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={'height'} keyboardVerticalOffset={20}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.logo}>
            <Image
              source={require('../assets/images/logomarca.png')}
              style={{ width: 200, height: 72, marginBottom: 30 }}
            />
          </View>

          <View
            style={styles.credentials}
            // bloqueia interação enquanto carrega
            pointerEvents={loading ? 'none' : 'auto'}
          >
            <Text style={styles.bemvindo}>Bem-vindo (a)</Text>

            {/* Campo de e-mail */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="account-circle" size={20} color="#093C85" style={styles.icon} />
              <TextInput
                editable={!loading}
                inputMode="email"
                autoComplete="email"
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Campo de senha */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#093C85" style={styles.icon} />
              <TextInput
                editable={!loading}
                secureTextEntry={secure}
                placeholder="Senha"
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity disabled={loading} onPress={() => setSecure(!secure)}>
                <Ionicons
                  name={secure ? 'eye-off' : 'eye'}
                  size={20}
                  color="#093C85"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={rememberMe}
                onValueChange={setRememberMe}
                color={rememberMe ? '#093C85' : undefined}
                disabled={loading}
              />
              <Text style={styles.checkboxLabel}>Manter-me conectado</Text>
            </View>

            {/* Botão de Logar (animado) */}
            <Animated.View
              style={{
                transform: [{ scale: scalePress }],
                alignItems: 'center',
                marginTop: 15,
              }}
            >
              <AnimatedTouchableOpacity
                activeOpacity={0.8}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handleLogin}
                disabled={loading}
                accessibilityRole="button"
                accessibilityState={{ busy: loading, disabled: loading }}
                style={[
                  styles.loginButton,
                  {
                    width: widthAnim,
                    height: BUTTON_HEIGHT,
                    borderRadius: radiusAnim,
                    opacity: loading ? 0.9 : 1,
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </AnimatedTouchableOpacity>
            </Animated.View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 10 }}>Oversee V. 1.0 By Lemarq Software</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
    height: 85,
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
    width: BUTTON_WIDTH,
    height: 40,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 8,
    fontSize: 16,
  },
  icon: { paddingHorizontal: 4 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  checkboxLabel: { marginLeft: 8, fontSize: 14, color: '#333' },
  loginButton: {
    backgroundColor: '#093C85',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    // width & borderRadius animadas
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: {
    flexDirection: 'row',
    marginTop: 15,
    paddingLeft: 20,
    alignItems: 'flex-end',
    height: 40,
  },
});
