import { ref, computed } from 'vue';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface FirebaseError extends Error {
    code?: string
}

const user = ref<User | null>(null);
const isAuthenticating = ref(true);
let _initialized = false;
let _resolveAuthReady: () => void;
const authReady = new Promise<void>((resolve) => {
    _resolveAuthReady = resolve;
});

const loginError = ref('');
const isAuthenticated = computed(() => !!user.value);
const googleProvider = new GoogleAuthProvider();

function initializeAuth(): void {
    if (_initialized) return;
    _initialized = true;

    onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'settings', 'auth');
                const settingsSnap = await getDoc(settingsRef);

                if (settingsSnap.exists()) {
                    const allowedEmails: string[] = settingsSnap.data().allowedEmails || [];
                    if (!allowedEmails.includes(currentUser.email || '')) {
                        console.error('Access Denied: User not in whitelist');
                        await signOut(auth);
                        user.value = null;
                        return;
                    }
                }
            } catch (e) {
                if ((e as FirebaseError).code === 'permission-denied') {
                    console.error('Access Denied: Permission error checking whitelist');
                } else {
                    console.error('Error checking auth whitelist:', e);
                }
                // Fail-closed: if we can't verify the whitelist, don't authenticate
                await signOut(auth);
                user.value = null;
                isAuthenticating.value = false;
                _resolveAuthReady();
                return;
            }
        }

        user.value = currentUser;
        isAuthenticating.value = false;
        _resolveAuthReady();
    });
}

async function signInWithGoogle(): Promise<void> {
    loginError.value = '';
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error('Login Failed', error);
        loginError.value = 'Login Failed: ' + (error as Error).message;
        throw error;
    }
}

async function logout(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout Failed', error);
        throw error;
    }
}

export function useAuth() {
    return {
        user,
        isAuthenticated,
        isAuthenticating,
        initializeAuth,
        authReady,
        signInWithGoogle,
        logout,
        loginError
    };
}
