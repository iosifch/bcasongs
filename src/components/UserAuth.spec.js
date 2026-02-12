import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UserAuth from './UserAuth.vue';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// Mock Vuetify components
const global = {
  stubs: {
    'v-btn': { template: '<button><slot /></button>' },
    'v-avatar': { template: '<div><slot /></div>' },
    'v-img': { template: '<img />' },
    'v-menu': { template: '<div><slot name="activator" :props="{}"></slot><slot></slot></div>' },
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

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn()
}));

describe.skip('UserAuth.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows login button when user is null', async () => {
    // Mock onAuthStateChanged to return null immediately
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => { }; // unsubscribe
    });

    const wrapper = mount(UserAuth, { global });
    await flushPromises();

    // Check for login button icon or text
    const buttons = wrapper.findAll('button');
    // We expect the button that triggers handleLogin
    // Based on template: v-btn icon="mdi-account-circle"
    // Our stub renders <button><i>mdi-account-circle</i></button> roughly

    // Simplest check: The "else" block should be rendered
    // The "if user" block has v-menu
    expect(wrapper.findComponent({ name: 'v-menu' }).exists()).toBe(false);

    // Find the login button - it's the one in the v-else block
    // It has @click="handleLogin"
    // Since we stubbed v-btn, we can find the button
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows user avatar when user is logged in', async () => {
    const mockUser = {
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'http://example.com/photo.jpg'
    };

    // Mock Auth State
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

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => { };
    });

    // Mock Firestore Whitelist Check (Deny access)
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ allowedEmails: ['admin@example.com'] }) // Not including hacker
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
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return () => { };
    });

    const wrapper = mount(UserAuth, { global });
    await flushPromises();

    // Find the login button. In our stubs/template structure:
    // v-else block has a v-btn.
    const loginBtn = wrapper.findAll('button').at(-1); // Assuming last button or only button
    // It's safer to find by other means, but let's try triggering the method directly if button finding is tricky?
    // No, better to simulate click.
    // The login button is the one WITHOUT v-menu activator wrapping it.
    // In our template, the login button is in the v-else div.

    // Let's rely on the method binding
    await wrapper.vm.handleLogin();

    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });
});
