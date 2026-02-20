import { useRouter } from 'vue-router';

export function useAppNavigation() {
  const router = useRouter();

  const goBack = (): void => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return {
    goBack
  };
}
