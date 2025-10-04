import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="dashboard"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}