import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UserAuth from './UserAuth.vue';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';

// Mock Vuetify components
const global = {
  stubs: {
    'v-btn': { template: '<button><slot /></button>' },
    'v-avatar': { template: '<div><slot /></div>' },
    'v-img': { template: '<img />' },
    'v-menu': { name: 'v-menu', template: '<div><slot name="activator" :props="{}"></slot><slot></slot></div>' },
    'v-card': { template: '<div><slot /></div>' },
    'v-card-text': { template: '<div><slot /></div>' },
    'v-divider': { template: '<hr />' },
    'v-snackbar': { template: '<div><slot></slot><slot name="actions"></slot></div>' },
    'v-icon': { template: '<i><slot /></i>' }
  }
};

// Mock Firebase
vi.mock('../firebaseConfig', () => ({
  auth: {},
  googleProvider: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

vi.mock('../composables/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn()
}));

import { useAuth } from '../composables/useAuth';

describe('UserAuth.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows login button when user is null', async () => {
    useAuth.mockReturnValue({
      user: ref(null),
      isAuthenticated: computed(() => false),
      initializeAuth: vi.fn()
    });

    const wrapper = mount(UserAuth, { global });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'v-menu' }).exists()).toBe(false);
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows user avatar when user is logged in', async () => {
    const mockUser = {
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'http://example.com/photo.jpg'
    };

    useAuth.mockReturnValue({
      user: ref(mockUser),
      isAuthenticated: computed(() => true),
      initializeAuth: vi.fn()
    });

    // We still need onAuthStateChanged for the whitelist check in onMounted if we want to test that logic
    // But wait, the component calls onAuthStateChanged in onMounted too...
    // The component calls:
    // onMounted(() => {
    //   initializeAuth();
    //   onAuthStateChanged(auth, async (currentUser) => { ... })
    // })

    // So we assume useAuth handles global auth state, but the component has its own listener for whitelist checking?
    // Yes on lines 68-91 of UserAuth.vue.

    // So we ALSO need to mock onAuthStateChanged to trigger that callback.
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => { };
    });

    // Mock Firestore Whitelist Check (Allow access)
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ allowedEmails: ['test@example.com'] })
    });

    const wrapper = mount(UserAuth, { global });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'v-menu' }).exists()).toBe(true);
    expect(wrapper.text()).toContain('Test User');
  });

  it('signs out if email is not in whitelist', async () => {
    const mockUser = { email: 'hacker@example.com' };

    useAuth.mockReturnValue({
      user: ref(mockUser),
      isAuthenticated: computed(() => true),
      initializeAuth: vi.fn()
    });

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => { };
    });

    // Mock Firestore Whitelist Check (Deny access)
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ allowedEmails: ['admin@example.com'] })
    });

    const wrapper = mount(UserAuth, { global });
    await flushPromises();

    // Expect signOut to be called
    expect(signOut).toHaveBeenCalledWith(auth);
    // Expect error message
    expect(wrapper.vm.snackbar).toBe(true);
    expect(wrapper.vm.errorMsg).toContain('Access Denied');
  });

  it('calls signInWithPopup when login button is clicked', async () => {
    useAuth.mockReturnValue({
      user: ref(null),
      isAuthenticated: computed(() => false),
      initializeAuth: vi.fn()
    });

    const wrapper = mount(UserAuth, { global });
    await flushPromises();

    await wrapper.vm.handleLogin();

    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });
});
