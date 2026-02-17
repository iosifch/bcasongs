import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import UserAuth from './UserAuth.vue';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { mountWithLayout, getSnackbarText } from '../test-utils';

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

// -- Helpers --
const setupUnauthenticated = () => {
  useAuth.mockReturnValue({
    user: ref(null),
    isAuthenticated: computed(() => false),
    isAuthenticating: ref(false),
    initializeAuth: vi.fn()
  });
};

const setupAuthenticated = (userOverrides = {}) => {
  const mockUser = {
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'http://example.com/photo.jpg',
    ...userOverrides
  };

  useAuth.mockReturnValue({
    user: ref(mockUser),
    isAuthenticated: computed(() => true),
    isAuthenticating: ref(false),
    initializeAuth: vi.fn()
  });

  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(mockUser);
    return () => {};
  });

  getDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ allowedEmails: [mockUser.email] })
  });

  return mockUser;
};

describe('UserAuth.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows login icon when user is not authenticated', async () => {
    setupUnauthenticated();

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'VMenu' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'VIcon' }).props('icon')).toBe('account_circle');
  });

  it('shows user avatar and menu when user is logged in', async () => {
    const mockUser = setupAuthenticated();

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    expect(wrapper.findComponent({ name: 'VMenu' }).exists()).toBe(true);

    const img = wrapper.findComponent({ name: 'VImg' });
    expect(img.exists()).toBe(true);
    expect(img.props('src')).toBe(mockUser.photoURL);
  });

  it('shows user name inside the menu when opened', async () => {
    setupAuthenticated({ displayName: 'John Doe' });

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    const menuContent = document.querySelector('.v-card');
    expect(menuContent?.textContent).toContain('John Doe');
  });

  it('calls signInWithPopup when login button is clicked', async () => {
    setupUnauthenticated();

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    await wrapper.find('button').trigger('click');

    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });

  it('shows error snackbar when login fails', async () => {
    setupUnauthenticated();
    signInWithPopup.mockRejectedValue(new Error('Popup closed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(getSnackbarText()).toContain('Login Failed');
    expect(getSnackbarText()).toContain('Popup closed');
  });
});
