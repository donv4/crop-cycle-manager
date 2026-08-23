// frontend/src/app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function StandaloneCropLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#E8F5E9', // Match your Dominica theme branding header
        },
        headerTintColor: '#1B5E20',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      {/* Set your main index file directly as the core screen view layout */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // Hidden because your main index file provides its own clean header layout
        }}
      />
    </Stack>
  );
}
