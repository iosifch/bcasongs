<template>
  <div class="d-flex align-center">
    <div v-if="user" class="d-flex align-center">
      <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="secondary" size="36">
              <v-img v-if="user.photoURL" :src="user.photoURL" alt="Avatar"></v-img>
              <span v-else class="text-h6">{{ user.displayName?.charAt(0) || 'U' }}</span>
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
        icon="mdi-account-circle"
        variant="text"
        density="comfortable"
        rounded="lg"
        @click="handleLogin"
        title="Login with Google"
      ></v-btn>
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

const user = ref(null);
const snackbar = ref(false);
const errorMsg = ref('');

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // Security Check: Verify if email is allowed (Frontend Check)
      // Note: Backend Rules are the real enforcer, this is for UX
      try {
        const settingsRef = doc(db, 'settings', 'auth');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const allowedEmails = settingsSnap.data().allowedEmails || [];
          if (!allowedEmails.includes(currentUser.email)) {
            errorMsg.value = 'Nu ai acces.';
            snackbar.value = true;
            await signOut(auth);
            return;
          }
        } else {
           // Allow if settings doc doesn't exist? Or block?
           // Assuming if not configured, maybe just warn or block.
           // For now, let's just log in, and writes will fail if not verified.
           console.warn('Auth settings document not found.');
        }
      } catch (e) {
        console.error('Error checking auth whitelist:', e);
        // Fallback: If we can't read the whitelist, we might be offline or it might be restricted
      }
      
      user.value = currentUser;
    } else {
      user.value = null;
    }
  });
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
