import { Tabs, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TabsLayout() {
  const segments = useSegments();

  //const hideTabBar = segments.includes('tabs/filial') || segments.includes('tabs/menu');

  return (
    <>
      <StatusBar style="inverted" backgroundColor="transparent" translucent />

      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="filial"
          options={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // para garantir que esteja oculta
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
    </>
  );
}
