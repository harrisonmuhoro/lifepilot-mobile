import { Redirect } from 'expo-router';

export default function Index() {
  // Direct entry into main dashboard shell
  return <Redirect href="/(tabs)" />;
}
