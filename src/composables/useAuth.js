import { ref, computed } from 'vue';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const user = ref(null);
const isAuthenticating = ref(true);
let _initialized = false;
let _resolveAuthReady;
const authReady = new Promise((resolve) => {
    _resolveAuthReady = resolve;
});

const isAuthenticated = computed(() => !!user.value);

function initializeAuth() {
    if (_initialized) return;
    _initialized = true;

    onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            try {
                const settingsRef = doc(db, 'settings', 'auth');
                const settingsSnap = await getDoc(settingsRef);
                
                if (settingsSnap.exists()) {
                    const allowedEmails = settingsSnap.data().allowedEmails || [];
                    if (!allowedEmails.includes(currentUser.email)) {
                        console.error('Access Denied: User not in whitelist');
                        await signOut(auth);
                        user.value = null;
                        return;
                    }
                }
            } catch (e) {
                if (e.code === 'permission-denied') {
                    console.error('Access Denied: Permission error checking whitelist');
                    await signOut(auth);
                    user.value = null;
                    return;
                }
                console.error('Error checking auth whitelist:', e);
            }
        }
        
        user.value = currentUser;
        isAuthenticating.value = false;
        _resolveAuthReady();
    });
}

export function useAuth() {
    return {
        user,
        isAuthenticated,
        isAuthenticating,
        initializeAuth,
        authReady
    };
}
