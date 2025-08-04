// components/SkeletonNotas.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ContentLoader, { Rect } from 'react-content-loader/native';

export default function SkeletonNotas() {
  return (
    <View style={styles.container}>
      {/* Simula 3 cards de notas */}
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={styles.card}>
          <ContentLoader
            speed={1}
            width={'100%'}
            height={80}
            backgroundColor="#e0e0e0"
            foregroundColor="#f5f5f5"
          >
            <Rect x="0" y="10" rx="4" ry="4" width="60%" height="15" />
            <Rect x="0" y="35" rx="4" ry="4" width="40%" height="12" />
            <Rect x="0" y="55" rx="4" ry="4" width="30%" height="12" />
          </ContentLoader>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
