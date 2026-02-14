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
            style="width: 40px; height: 40px; min-width: 40px; padding: 0;"
          >
            <v-avatar :size="28">
              <v-img v-if="user.photoURL" :src="user.photoURL" alt="Avatar"></v-img>
              <span v-else class="text-caption font-weight-bold">{{ user.displayName?.charAt(0) || 'U' }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
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
              <v-btn rounded variant="text" @click="handleSignOut">
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
        <v-icon size="25">account_circle</v-icon>
      </v-btn>
    </div>
    
    <v-snackbar v-model="snackbar" :timeout="3000" color="error">
      {{ errorMsg }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../composables/useAuth';

const { isAuthenticated } = useAuth();
const { user, initializeAuth } = useAuth();
const snackbar = ref(false);
const errorMsg = ref('');

defineProps({
  size: {
    type: String,
    default: undefined
  },
  avatarSize: {
    type: Number,
    default: 26
  }
});

onMounted(() => {
  initializeAuth();
});

const handleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Login Failed', error);
    errorMsg.value = 'Login Failed: ' + error.message;
    snackbar.value = true;
  }
};

const handleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout Failed', error);
  }
};
</script>

<style scoped>
</style>
