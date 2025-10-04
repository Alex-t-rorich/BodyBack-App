import { Stack } from 'expo-router';

export default function TrainerLayout() {
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