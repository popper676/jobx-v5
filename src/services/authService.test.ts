import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from './authService';
import { db } from './db';

describe('authService', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should return initial logged-out state', () => {
    const state = authService.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBe('');
    expect(authService.isLoggedIn()).toBe(false);
  });

  it('should register a new user successfully', () => {
    const res = authService.signup('John Doe', 'john@example.com', 'password123');
    expect(res.success).toBe(true);
    expect(res.state).toBeDefined();
    expect(res.state?.email).toBe('john@example.com');
    expect(res.state?.name).toBe('John Doe');
    expect(res.state?.isAuthenticated).toBe(true);

    const currentState = authService.getState();
    expect(currentState.isAuthenticated).toBe(true);
    expect(currentState.name).toBe('John Doe');
    expect(authService.isLoggedIn()).toBe(true);
  });

  it('should validate inputs during signup', () => {
    const resEmptyName = authService.signup('', 'john@example.com', 'password123');
    expect(resEmptyName.success).toBe(false);
    expect(resEmptyName.error).toBe('Name is required.');

    const resEmptyEmail = authService.signup('John', ' ', 'password123');
    expect(resEmptyEmail.success).toBe(false);
    expect(resEmptyEmail.error).toBe('Email is required.');

    const resShortPass = authService.signup('John', 'john@example.com', '123');
    expect(resShortPass.success).toBe(false);
    expect(resShortPass.error).toBe('Password must be at least 6 characters.');
  });

  it('should prevent duplicate signup emails', () => {
    authService.signup('John Doe', 'john@example.com', 'password123');
    const res = authService.signup('John Redux', 'john@example.com', 'differentpassword');
    expect(res.success).toBe(false);
    expect(res.error).toBe('An account with this email already exists.');
  });

  it('should login an existing user', () => {
    authService.signup('John Doe', 'john@example.com', 'password123');
    authService.logout();

    expect(authService.isLoggedIn()).toBe(false);

    const res = authService.login('john@example.com', 'password123');
    expect(res.success).toBe(true);
    expect(res.state?.isAuthenticated).toBe(true);
    expect(authService.isLoggedIn()).toBe(true);
  });

  it('should fail login on wrong credentials', () => {
    authService.signup('John Doe', 'john@example.com', 'password123');
    authService.logout();

    const resWrongEmail = authService.login('wrong@example.com', 'password123');
    expect(resWrongEmail.success).toBe(false);
    expect(resWrongEmail.error).toBe('No account found with this email.');

    const resWrongPass = authService.login('john@example.com', 'wrongpassword');
    expect(resWrongPass.success).toBe(false);
    expect(resWrongPass.error).toBe('Incorrect password.');
  });

  it('should logout correctly', () => {
    authService.signup('John Doe', 'john@example.com', 'password123');
    expect(authService.isLoggedIn()).toBe(true);

    const loggedOutState = authService.logout();
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(authService.isLoggedIn()).toBe(false);
  });
});
