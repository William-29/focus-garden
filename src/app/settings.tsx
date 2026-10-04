import { router } from 'expo-router';
import { GardenSettings } from '@/components/garden/garden-panels';

export default function SettingsScreen() {
  return <GardenSettings onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}
