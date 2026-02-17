import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import UserAuth from './UserAuth.vue';
import { ref, computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { mountWithLayout, getSnackbarText } from '../test-utils';

vi.mock('../composables/useAuth', () => ({
  useAuth: vi.fn()
}));

// -- Helpers --
const mockSignInWithGoogle = vi.fn();
const mockLogout = vi.fn();

const setupUnauthenticated = () => {
  useAuth.mockReturnValue({
    user: ref(null),
    isAuthenticated: computed(() => false),
    isAuthenticating: ref(false),
    initializeAuth: vi.fn(),
    signInWithGoogle: mockSignInWithGoogle,
    logout: mockLogout,
    loginError: ref('')
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
    initializeAuth: vi.fn(),
    signInWithGoogle: mockSignInWithGoogle,
    logout: mockLogout,
    loginError: ref('')
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

    const menuContent = document.querySelector('[data-testid="user-menu-card"]');
    expect(menuContent?.textContent).toContain('John Doe');
  });

  it('calls signInWithGoogle when login button is clicked', async () => {
    setupUnauthenticated();

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('shows error snackbar when login fails', async () => {
    const loginError = ref('');
    mockSignInWithGoogle.mockImplementation(async () => {
      loginError.value = 'Login Failed: Popup closed';
      throw new Error('Popup closed');
    });

    useAuth.mockReturnValue({
      user: ref(null),
      isAuthenticated: computed(() => false),
      isAuthenticating: ref(false),
      initializeAuth: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      logout: mockLogout,
      loginError
    });

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(getSnackbarText()).toContain('Login Failed');
    expect(getSnackbarText()).toContain('Popup closed');
  });

  it('calls logout when logout button is clicked', async () => {
    setupAuthenticated();

    const wrapper = mountWithLayout(UserAuth);
    await flushPromises();

    // Open the user menu
    await wrapper.find('button').trigger('click');
    await flushPromises();

    // Click the Logout button in the teleported menu card
    const logoutBtn = document.querySelector('[data-testid="logout-btn"]');
    logoutBtn.click();
    await flushPromises();

    expect(mockLogout).toHaveBeenCalled();
  });
});
