import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FilialProvider } from './tabs/contexts/filialContext';
import { UsuarioProvider } from './tabs/contexts/usuarioContext';


export default function RootLayout() {
  return (
    <>
      <StatusBar style="inverted" backgroundColor="transparent" translucent />
      <UsuarioProvider>
        <FilialProvider>
          <Stack screenOptions={{ headerShown: false,}}>
            
            <Stack.Screen name="login" 
              options={{ headerShown: false }}
            />
          </Stack>
        </FilialProvider>
      </UsuarioProvider>
    </>
  );
}
