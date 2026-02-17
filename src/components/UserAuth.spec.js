import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UserAuth from './UserAuth.vue';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { mountWithLayout } from '../test-utils';

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

describe('UserAuth.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows login button when user is null', async () => {
    useAuth.mockReturnValue({
      user: ref(null),
      isAuthenticated: computed(() => false),
      isAuthenticating: ref(false),
      initializeAuth: vi.fn()
    });

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'VMenu' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'VIcon' }).props('icon')).toBe('account_circle');
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
      isAuthenticating: ref(false),
      initializeAuth: vi.fn()
    });

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => { };
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ allowedEmails: ['test@example.com'] })
    });

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'VMenu' }).exists()).toBe(true);
    
    const img = wrapper.findComponent({ name: 'VImg' });
    expect(img.exists()).toBe(true);
    expect(img.props('src')).toBe('http://example.com/photo.jpg');
    
    await wrapper.find('button').trigger('click');
    await flushPromises();
    
    expect(document.body.innerHTML).toContain('Test User');
  });

  it('calls signInWithPopup when login button is clicked', async () => {
    useAuth.mockReturnValue({
      user: ref(null),
      isAuthenticated: computed(() => false),
      isAuthenticating: ref(false),
      initializeAuth: vi.fn()
    });

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    await wrapper.find('button').trigger('click');

    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });
});
