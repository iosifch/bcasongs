<template>
  <div class="d-flex align-center">
    <div v-if="user" class="d-flex align-center">
      <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="tonal"
            color="surface-variant"
            rounded="lg"
            density="comfortable"
            icon
          >
            <v-avatar :size="28">
              <v-img v-if="user.photoURL" :src="user.photoURL" alt="Avatar"></v-img>
              <span v-else class="text-caption font-weight-bold">{{ user.displayName?.charAt(0) || 'U' }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card data-testid="user-menu-card">
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="secondary">
                <v-img v-if="user.photoURL" :src="user.photoURL" alt="Avatar"></v-img>
                <span v-else class="text-h6">{{ user.displayName?.charAt(0) || 'U' }}</span>
              </v-avatar>
              <h3 class="mt-2 text-caption">{{ user.displayName }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="handleSignOut" data-testid="logout-btn">
                Logout
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>

    <div v-else>
      <v-btn
        icon
        variant="tonal"
        color="surface-variant"
        :size="size"
        rounded="lg"
        @click="handleLogin"
        title="Login with Google"
        density="comfortable"
        style="width: 40px; height: 40px; min-width: 40px;"
      >
        <v-icon size="25" icon="account_circle"></v-icon>
      </v-btn>
    </div>
    
    <v-snackbar v-model="snackbar" :timeout="3000" color="error" data-testid="snackbar">
      {{ errorMsg }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';

const { user, initializeAuth, signInWithGoogle, logout, loginError } = useAuth();
const snackbar = ref(false);
const errorMsg = ref('');

defineProps<{
  size?: string;
  avatarSize?: number;
}>();

onMounted(() => {
  initializeAuth();
});

const handleLogin = async () => {
  try {
    await signInWithGoogle();
  } catch {
    errorMsg.value = loginError.value;
    snackbar.value = true;
  }
};

const handleSignOut = async () => {
  await logout();
};
</script>

<style scoped>
</style>
