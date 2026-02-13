import { ref, computed } from 'vue';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const user = ref(null);
let _initialized = false;

const isAuthenticated = computed(() => !!user.value);

function initializeAuth() {
    if (_initialized) return;
    _initialized = true;

    onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
    });
}

export function useAuth() {
    return {
        user,
        isAuthenticated,
        initializeAuth
    };
}
