import { router } from 'expo-router';
import { SeedShop } from '@/components/garden/garden-panels';

export default function ShopScreen() {
  return <SeedShop native={false} onClose={() => router.canGoBack() ? router.back() : router.replace('/')} />;
}
