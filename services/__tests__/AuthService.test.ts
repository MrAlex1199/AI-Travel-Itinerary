/**
 * Authentication Service Tests
 * 
 * Tests for user registration, login, session management, and authorization.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../AuthService';
import { clearDatabase } from '@/lib/db/connection';
import * as fc from 'fast-check';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    clearDatabase();
    AuthService.clearSessions();
    authService = new AuthService();
  });

  afterEach(() => {
    clearDatabase();
    AuthService.clearSessions();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const user = await authService.register(email, password);

      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(password); // Password should be hashed
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for duplicate email', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      await authService.register(email, password);

      await expect(authService.register(email, password)).rejects.toThrow(
        'Email already exists'
      );
    });

    it('should throw error for invalid email format', async () => {
      await expect(authService.register('invalid-email', 'password123')).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should throw error for weak password', async () => {
      await expect(authService.register('test@example.com', 'short')).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials and create session', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Register user first
      await authService.register(email, password);

      // Login
      const session = await authService.login(email, password);

      expect(session.sessionId).toBeDefined();
      expect(session.user.email).toBe(email);
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for incorrect password', async () => {
      const email = 'test@example.com';
      await authService.register(email, 'password123');

      await expect(authService.login(email, 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('verifySession', () => {
    it('should verify valid session and return user', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      await authService.register(email, password);
      const session = await authService.login(email, password);

      const user = await authService.verifySession(session.sessionId);

      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
    });

    it('should return null for invalid session', async () => {
      const user = await authService.verifySession('invalid-session-id');
      expect(user).toBeNull();
    });

    it('should return null for expired session', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      await authService.register(email, password);
      const session = await authService.login(email, password);

      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      const user = await authService.verifySession(session.sessionId);
      expect(user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should invalidate session', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      await authService.register(email, password);
      const session = await authService.login(email, password);

      // Verify session exists
      let user = await authService.verifySession(session.sessionId);
      expect(user).not.toBeNull();

      // Logout
      await authService.logout(session.sessionId);

      // Verify session is invalidated
      user = await authService.verifySession(session.sessionId);
      expect(user).toBeNull();
    });
  });

  describe('session management', () => {
    it('should create session on successful login', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      await authService.register(email, password);
      
      const initialSessionCount = AuthService.getSessionCount();
      await authService.login(email, password);
      
      expect(AuthService.getSessionCount()).toBe(initialSessionCount + 1);
    });

    it('should allow multiple concurrent sessions', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      await authService.register(email, password);

      const session1 = await authService.login(email, password);
      const session2 = await authService.login(email, password);

      expect(session1.sessionId).not.toBe(session2.sessionId);

      const user1 = await authService.verifySession(session1.sessionId);
      const user2 = await authService.verifySession(session2.sessionId);

      expect(user1).not.toBeNull();
      expect(user2).not.toBeNull();
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 15: Registration creates user accounts
    // Validates: Requirements 7.2
    it('should create user accounts for any valid email and password combination', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email addresses
          fc.emailAddress(),
          // Generate valid passwords (at least 8 characters)
          fc.string({ minLength: 8, maxLength: 50 }),
          async (email, password) => {
            // Clear database before each property test iteration
            clearDatabase();
            AuthService.clearSessions();
            const service = new AuthService();

            // Register user with generated credentials
            const user = await service.register(email, password);

            // Verify user account was created with correct properties
            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.email).toBe(email);
            expect(user.passwordHash).toBeDefined();
            expect(user.passwordHash).not.toBe(password); // Password should be hashed
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property-based test with bcrypt hashing

    // Feature: ai-travel-itinerary, Property 16: Login verifies credentials
    // Validates: Requirements 7.3
    it('should verify credentials and return success only if they match', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email addresses
          fc.emailAddress(),
          // Generate valid passwords (at least 8 characters)
          fc.string({ minLength: 8, maxLength: 50 }),
          // Generate a different wrong password
          fc.string({ minLength: 8, maxLength: 50 }),
          async (email, correctPassword, wrongPassword) => {
            // Skip if passwords happen to be the same
            fc.pre(correctPassword !== wrongPassword);

            // Clear database before each property test iteration
            clearDatabase();
            AuthService.clearSessions();
            const service = new AuthService();

            // Register user with correct credentials
            await service.register(email, correctPassword);

            // Test 1: Login with correct credentials should succeed
            const successSession = await service.login(email, correctPassword);
            expect(successSession).toBeDefined();
            expect(successSession.sessionId).toBeDefined();
            expect(successSession.user.email).toBe(email);
            expect(successSession.expiresAt).toBeInstanceOf(Date);
            expect(successSession.expiresAt.getTime()).toBeGreaterThan(Date.now());

            // Test 2: Login with wrong password should fail
            await expect(service.login(email, wrongPassword)).rejects.toThrow('Invalid credentials');

            // Test 3: Login with non-existent email should fail
            const nonExistentEmail = `nonexistent-${email}`;
            await expect(service.login(nonExistentEmail, correctPassword)).rejects.toThrow('Invalid credentials');
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property-based test with bcrypt hashing

    // Feature: ai-travel-itinerary, Property 17: Successful authentication creates session
    // Validates: Requirements 7.4
    it('should create a session and grant access to protected features on successful login', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email addresses
          fc.emailAddress(),
          // Generate valid passwords (at least 8 characters)
          fc.string({ minLength: 8, maxLength: 50 }),
          async (email, password) => {
            // Clear database before each property test iteration
            clearDatabase();
            AuthService.clearSessions();
            const service = new AuthService();

            // Register user first
            await service.register(email, password);

            // Track initial session count
            const initialSessionCount = AuthService.getSessionCount();

            // Login with valid credentials
            const session = await service.login(email, password);

            // Verify session was created
            expect(session).toBeDefined();
            expect(session.sessionId).toBeDefined();
            expect(typeof session.sessionId).toBe('string');
            expect(session.sessionId.length).toBeGreaterThan(0);

            // Verify session contains user information
            expect(session.user).toBeDefined();
            expect(session.user.email).toBe(email);
            expect(session.user.id).toBeDefined();

            // Verify session has expiration time
            expect(session.expiresAt).toBeInstanceOf(Date);
            expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());

            // Verify session count increased (session was stored)
            expect(AuthService.getSessionCount()).toBe(initialSessionCount + 1);

            // Verify session grants access to protected features by verifying the session
            const verifiedUser = await service.verifySession(session.sessionId);
            expect(verifiedUser).not.toBeNull();
            expect(verifiedUser?.email).toBe(email);
            expect(verifiedUser?.id).toBe(session.user.id);
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property-based test with bcrypt hashing

    // Feature: ai-travel-itinerary, Property 18: Failed authentication rejects access
    // Validates: Requirements 7.5
    it('should reject access and display error message for invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email addresses
          fc.emailAddress(),
          // Generate valid passwords (at least 8 characters)
          fc.string({ minLength: 8, maxLength: 50 }),
          // Generate invalid credentials
          fc.string({ minLength: 8, maxLength: 50 }),
          async (email, correctPassword, wrongPassword) => {
            // Skip if passwords happen to be the same
            fc.pre(correctPassword !== wrongPassword);

            // Clear database before each property test iteration
            clearDatabase();
            AuthService.clearSessions();
            const service = new AuthService();

            // Register user with correct credentials
            await service.register(email, correctPassword);

            // Test 1: Login with wrong password should reject access
            let errorThrown = false;
            let errorMessage = '';
            try {
              await service.login(email, wrongPassword);
            } catch (error) {
              errorThrown = true;
              errorMessage = error instanceof Error ? error.message : '';
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toBe('Invalid credentials');

            // Test 2: Verify no session was created for failed login
            const sessionCountAfterFailedLogin = AuthService.getSessionCount();
            expect(sessionCountAfterFailedLogin).toBe(0);

            // Test 3: Login with non-existent email should reject access
            const nonExistentEmail = `nonexistent-${email}`;
            errorThrown = false;
            errorMessage = '';
            try {
              await service.login(nonExistentEmail, correctPassword);
            } catch (error) {
              errorThrown = true;
              errorMessage = error instanceof Error ? error.message : '';
            }
            
            expect(errorThrown).toBe(true);
            expect(errorMessage).toBe('Invalid credentials');

            // Test 4: Verify attempting to verify with invalid session ID returns null (no access)
            const invalidSessionId = 'invalid-session-id-12345';
            const user = await service.verifySession(invalidSessionId);
            expect(user).toBeNull();

            // Test 5: Verify that after failed authentication, a subsequent successful login still works
            const successSession = await service.login(email, correctPassword);
            expect(successSession).toBeDefined();
            expect(successSession.sessionId).toBeDefined();
            expect(successSession.user.email).toBe(email);
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property-based test with bcrypt hashing
  });
});
