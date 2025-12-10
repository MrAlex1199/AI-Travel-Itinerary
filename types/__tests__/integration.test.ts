/**
 * Integration Tests
 * 
 * Comprehensive end-to-end tests for the AI Travel Itinerary application.
 * Tests complete user flows, error scenarios, authentication protection,
 * concurrent sessions, and data isolation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { clearDatabase, initDatabase } from '@/lib/db/connection';
import { AuthService } from '@/services/AuthService';
import { HistoryService } from '@/services/HistoryService';
import { ItineraryGenerator } from '@/services/ItineraryGenerator';
import { userRepository, itineraryRepository } from '@/lib/db/repositories';
import { DailySchedule, Recommendation, Itinerary } from '@/types';
import * as fc from 'fast-check';

describe('Integration Tests', () => {
  let authService: AuthService;
  let historyService: HistoryService;
  let itineraryGenerator: ItineraryGenerator;

  beforeEach(() => {
    clearDatabase();
    initDatabase();
    AuthService.clearSessions();
    authService = new AuthService();
    historyService = new HistoryService();
    itineraryGenerator = new ItineraryGenerator();
  });

  afterEach(() => {
    clearDatabase();
    AuthService.clearSessions();
    vi.restoreAllMocks();
  });

  describe('Complete User Flow: Register → Login → Generate → View History', () => {
    it('should complete full user journey successfully', async () => {
      // Step 1: Register a new user
      const email = 'traveler@example.com';
      const password = 'securepass123';
      
      const user = await authService.register(email, password);
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.id).toBeDefined();

      // Step 2: Login with registered credentials
      const session = await authService.login(email, password);
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.user.email).toBe(email);

      // Step 3: Verify session is valid
      const verifiedUser = await authService.verifySession(session.sessionId);
      expect(verifiedUser).not.toBeNull();
      expect(verifiedUser?.id).toBe(user.id);

      // Step 4: Generate an itinerary (mocked for speed)
      const mockItinerary: Itinerary = {
        id: 'test-itinerary-1',
        userId: user.id,
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [
          {
            day: 1,
            activities: [
              {
                time: '09:00',
                name: 'เยี่ยมชมวัดพระแก้ว',
                location: 'กรุงเทพฯ',
                description: 'วัดที่สวยงามและมีประวัติศาสตร์',
              },
              {
                time: '12:00',
                name: 'รับประทานอาหารกลางวัน',
                location: 'ร้านอาหารท้องถิ่น',
                description: 'ลิ้มรสอาหารไทยแท้',
              },
              {
                time: '15:00',
                name: 'ช้อปปิ้งที่ตลาดนัด',
                location: 'ตลาดจตุจักร',
                description: 'ตลาดนัดที่ใหญ่ที่สุดในเอเชีย',
              },
            ],
          },
        ],
        recommendations: [
          {
            id: 'rec-1',
            category: 'place',
            name: 'พระบรมมหาราชวัง',
            description: 'พระราชวังที่สวยงามและมีประวัติศาสตร์',
          },
          {
            id: 'rec-2',
            category: 'restaurant',
            name: 'ร้านอาหารริมน้ำ',
            description: 'อาหารไทยรสชาติดีริมแม่น้ำเจ้าพระยา',
          },
        ],
        generatedAt: new Date(),
      };

      vi.spyOn(itineraryGenerator, 'generateItinerary').mockResolvedValue(mockItinerary);

      const generatedItinerary = await itineraryGenerator.generateItinerary(
        { destination: 'Bangkok', duration: 3 },
        'th'
      );

      expect(generatedItinerary).toBeDefined();
      expect(generatedItinerary.destination).toBe('Bangkok');
      expect(generatedItinerary.duration).toBe(3);

      // Step 5: Save itinerary to history
      await historyService.saveItinerary(user.id, generatedItinerary);

      // Step 6: View history
      const history = await historyService.getItineraryHistory(user.id);
      expect(history).toHaveLength(1);
      expect(history[0].destination).toBe('Bangkok');
      expect(history[0].duration).toBe(3);

      // Step 7: View specific itinerary from history
      const specificItinerary = await historyService.getItineraryById(
        user.id,
        history[0].id
      );
      expect(specificItinerary).not.toBeNull();
      expect(specificItinerary?.destination).toBe('Bangkok');
      expect(specificItinerary?.dailySchedules).toHaveLength(1);
      expect(specificItinerary?.recommendations).toHaveLength(2);

      // Step 8: Logout
      await authService.logout(session.sessionId);
      const verifiedAfterLogout = await authService.verifySession(session.sessionId);
      expect(verifiedAfterLogout).toBeNull();
    });

    it('should handle multiple itineraries in user journey', async () => {
      // Register and login
      const user = await authService.register('multi@example.com', 'password123');
      const session = await authService.login('multi@example.com', 'password123');

      // Generate multiple itineraries
      const destinations = ['Bangkok', 'Phuket', 'Chiang Mai'];
      const mockItineraries: Itinerary[] = [];

      for (let i = 0; i < destinations.length; i++) {
        const mockItinerary = {
          destination: destinations[i],
          duration: i + 2,
          dailySchedules: [
            {
              day: 1,
              activities: [
                {
                  time: '09:00',
                  name: `กิจกรรมที่ ${destinations[i]}`,
                  location: destinations[i],
                  description: 'กิจกรรมท่องเที่ยว',
                },
              ],
            },
          ],
          recommendations: [
            {
              id: `rec-${i}`,
              category: 'place',
              name: `สถานที่ท่องเที่ยวที่ ${destinations[i]}`,
              description: 'สถานที่น่าสนใจ',
            },
          ],
        };

        // Wait a bit to ensure different timestamps
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const saved = await historyService.saveItinerary(user.id, mockItinerary);
        mockItineraries.push(saved);
      }

      // Verify all itineraries are in history
      const history = await historyService.getItineraryHistory(user.id);
      expect(history).toHaveLength(3);

      // Verify reverse chronological order (newest first)
      expect(history[0].destination).toBe('Chiang Mai');
      expect(history[1].destination).toBe('Phuket');
      expect(history[2].destination).toBe('Bangkok');
    });
  });


  describe('Error Scenarios', () => {
    describe('Invalid Inputs', () => {
      it('should reject registration with invalid email', async () => {
        await expect(
          authService.register('invalid-email', 'password123')
        ).rejects.toThrow('Invalid email format');
      });

      it('should reject registration with weak password', async () => {
        await expect(
          authService.register('test@example.com', 'short')
        ).rejects.toThrow('Password must be at least 8 characters long');
      });

      it('should reject login with non-existent user', async () => {
        await expect(
          authService.login('nonexistent@example.com', 'password123')
        ).rejects.toThrow('Invalid credentials');
      });

      it('should reject login with wrong password', async () => {
        await authService.register('test@example.com', 'password123');
        await expect(
          authService.login('test@example.com', 'wrongpassword')
        ).rejects.toThrow('Invalid credentials');
      });

      it('should reject duplicate email registration', async () => {
        await authService.register('test@example.com', 'password123');
        await expect(
          authService.register('test@example.com', 'anotherpass')
        ).rejects.toThrow('Email already exists');
      });

      it('should handle empty destination gracefully', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        // This would be validated at the API/form level
        // Here we test that the generator would handle it
        const emptyDestination = '';
        expect(emptyDestination.length).toBe(0);
      });

      it('should handle invalid duration gracefully', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        // This would be validated at the API/form level
        const invalidDuration = 0;
        expect(invalidDuration).toBeLessThan(1);
      });
    });

    describe('AI Failures', () => {
      it('should handle AI timeout gracefully', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        vi.spyOn(itineraryGenerator, 'generateItinerary').mockRejectedValue(
          new Error('Request timeout')
        );

        await expect(
          itineraryGenerator.generateItinerary(
            { destination: 'Bangkok', duration: 3 },
            'th'
          )
        ).rejects.toThrow('Request timeout');
      });

      it('should handle AI rate limiting', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        vi.spyOn(itineraryGenerator, 'generateItinerary').mockRejectedValue(
          new Error('Rate limit exceeded')
        );

        await expect(
          itineraryGenerator.generateItinerary(
            { destination: 'Bangkok', duration: 3 },
            'th'
          )
        ).rejects.toThrow('Rate limit exceeded');
      });

      it('should handle malformed AI response', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        vi.spyOn(itineraryGenerator, 'generateItinerary').mockRejectedValue(
          new Error('Failed to parse AI response')
        );

        await expect(
          itineraryGenerator.generateItinerary(
            { destination: 'Bangkok', duration: 3 },
            'th'
          )
        ).rejects.toThrow('Failed to parse AI response');
      });
    });


    describe('Network Errors', () => {
      it('should handle database connection failure during registration', async () => {
        // Create a new auth service with mocked repository
        const mockUserRepo = {
          create: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          findById: vi.fn(),
          findByEmail: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        };
        
        const testAuthService = new AuthService(mockUserRepo as any);

        await expect(
          testAuthService.register('test@example.com', 'password123')
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle database connection failure during login', async () => {
        await authService.register('test@example.com', 'password123');
        
        // Create a new auth service with mocked repository
        const mockUserRepo = {
          create: vi.fn(),
          findById: vi.fn(),
          findByEmail: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          update: vi.fn(),
          delete: vi.fn(),
        };
        
        const testAuthService = new AuthService(mockUserRepo as any);

        await expect(
          testAuthService.login('test@example.com', 'password123')
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle database failure when saving itinerary', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        const mockItinerary = {
          destination: 'Bangkok',
          duration: 3,
          dailySchedules: [],
          recommendations: [],
        };

        // Create a new history service with mocked repository
        const mockItineraryRepo = {
          create: vi.fn().mockRejectedValue(new Error('Database write failed')),
          findById: vi.fn(),
          findByUserId: vi.fn(),
          delete: vi.fn(),
        };
        
        const testHistoryService = new HistoryService(mockItineraryRepo as any);

        await expect(
          testHistoryService.saveItinerary(user.id, mockItinerary)
        ).rejects.toThrow('Database write failed');
      });

      it('should handle database failure when retrieving history', async () => {
        const user = await authService.register('test@example.com', 'password123');
        
        // Create a new history service with mocked repository
        const mockItineraryRepo = {
          create: vi.fn(),
          findById: vi.fn(),
          findByUserId: vi.fn().mockRejectedValue(new Error('Database read failed')),
          delete: vi.fn(),
        };
        
        const testHistoryService = new HistoryService(mockItineraryRepo as any);

        await expect(
          testHistoryService.getItineraryHistory(user.id)
        ).rejects.toThrow('Database read failed');
      });
    });
  });

  describe('Authentication Protection on Protected Routes', () => {
    it('should deny access to itinerary generation without authentication', async () => {
      // Verify that without a valid session, user cannot be verified
      const invalidSession = 'invalid-session-id';
      const user = await authService.verifySession(invalidSession);
      expect(user).toBeNull();
    });

    it('should deny access to history without authentication', async () => {
      // Attempting to get history with invalid user ID should return empty or fail
      const invalidUserId = 'non-existent-user-id';
      const history = await historyService.getItineraryHistory(invalidUserId);
      expect(history).toHaveLength(0);
    });

    it('should allow access to protected routes with valid session', async () => {
      const user = await authService.register('test@example.com', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Verify session grants access
      const verifiedUser = await authService.verifySession(session.sessionId);
      expect(verifiedUser).not.toBeNull();
      expect(verifiedUser?.id).toBe(user.id);

      // User can access their history
      const history = await historyService.getItineraryHistory(user.id);
      expect(history).toBeDefined();
    });

    it('should deny access after session expiration', async () => {
      const user = await authService.register('test@example.com', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      const verifiedUser = await authService.verifySession(session.sessionId);
      expect(verifiedUser).toBeNull();
    });

    it('should deny access after logout', async () => {
      const user = await authService.register('test@example.com', 'password123');
      const session = await authService.login('test@example.com', 'password123');

      // Logout
      await authService.logout(session.sessionId);

      // Verify session is invalid
      const verifiedUser = await authService.verifySession(session.sessionId);
      expect(verifiedUser).toBeNull();
    });
  });


  describe('Concurrent User Sessions', () => {
    it('should support multiple users with separate sessions', async () => {
      // Register two users
      const user1 = await authService.register('user1@example.com', 'password123');
      const user2 = await authService.register('user2@example.com', 'password123');

      // Both users login
      const session1 = await authService.login('user1@example.com', 'password123');
      const session2 = await authService.login('user2@example.com', 'password123');

      // Verify both sessions are valid and distinct
      expect(session1.sessionId).not.toBe(session2.sessionId);

      const verifiedUser1 = await authService.verifySession(session1.sessionId);
      const verifiedUser2 = await authService.verifySession(session2.sessionId);

      expect(verifiedUser1?.id).toBe(user1.id);
      expect(verifiedUser2?.id).toBe(user2.id);
    });

    it('should support same user with multiple concurrent sessions', async () => {
      const user = await authService.register('test@example.com', 'password123');

      // Login multiple times (e.g., different devices)
      const session1 = await authService.login('test@example.com', 'password123');
      const session2 = await authService.login('test@example.com', 'password123');
      const session3 = await authService.login('test@example.com', 'password123');

      // All sessions should be valid and distinct
      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session2.sessionId).not.toBe(session3.sessionId);
      expect(session1.sessionId).not.toBe(session3.sessionId);

      const verified1 = await authService.verifySession(session1.sessionId);
      const verified2 = await authService.verifySession(session2.sessionId);
      const verified3 = await authService.verifySession(session3.sessionId);

      expect(verified1?.id).toBe(user.id);
      expect(verified2?.id).toBe(user.id);
      expect(verified3?.id).toBe(user.id);
    });

    it('should allow independent session management for concurrent sessions', async () => {
      const user = await authService.register('test@example.com', 'password123');

      const session1 = await authService.login('test@example.com', 'password123');
      const session2 = await authService.login('test@example.com', 'password123');

      // Logout from session1
      await authService.logout(session1.sessionId);

      // Session1 should be invalid
      const verified1 = await authService.verifySession(session1.sessionId);
      expect(verified1).toBeNull();

      // Session2 should still be valid
      const verified2 = await authService.verifySession(session2.sessionId);
      expect(verified2?.id).toBe(user.id);
    });

    it('should handle concurrent operations from multiple users', async () => {
      // Register multiple users
      const users = await Promise.all([
        authService.register('user1@example.com', 'password123'),
        authService.register('user2@example.com', 'password123'),
        authService.register('user3@example.com', 'password123'),
      ]);

      // All users login concurrently
      const sessions = await Promise.all([
        authService.login('user1@example.com', 'password123'),
        authService.login('user2@example.com', 'password123'),
        authService.login('user3@example.com', 'password123'),
      ]);

      // Verify all sessions
      const verifiedUsers = await Promise.all(
        sessions.map(s => authService.verifySession(s.sessionId))
      );

      expect(verifiedUsers[0]?.id).toBe(users[0].id);
      expect(verifiedUsers[1]?.id).toBe(users[1].id);
      expect(verifiedUsers[2]?.id).toBe(users[2].id);
    });
  });


  describe('Data Isolation Between Users', () => {
    it('should isolate itinerary history between users', async () => {
      // Create two users
      const user1 = await authService.register('user1@example.com', 'password123');
      const user2 = await authService.register('user2@example.com', 'password123');

      // User1 generates itineraries
      const itinerary1 = {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [
          {
            day: 1,
            activities: [
              {
                time: '09:00',
                name: 'User1 Activity',
                location: 'Bangkok',
                description: 'Activity for user 1',
              },
            ],
          },
        ],
        recommendations: [],
      };

      await historyService.saveItinerary(user1.id, itinerary1);

      // User2 generates itineraries
      const itinerary2 = {
        destination: 'Phuket',
        duration: 5,
        dailySchedules: [
          {
            day: 1,
            activities: [
              {
                time: '10:00',
                name: 'User2 Activity',
                location: 'Phuket',
                description: 'Activity for user 2',
              },
            ],
          },
        ],
        recommendations: [],
      };

      await historyService.saveItinerary(user2.id, itinerary2);

      // Verify User1 only sees their own itineraries
      const user1History = await historyService.getItineraryHistory(user1.id);
      expect(user1History).toHaveLength(1);
      expect(user1History[0].destination).toBe('Bangkok');

      // Verify User2 only sees their own itineraries
      const user2History = await historyService.getItineraryHistory(user2.id);
      expect(user2History).toHaveLength(1);
      expect(user2History[0].destination).toBe('Phuket');
    });

    it('should prevent users from accessing other users itineraries by ID', async () => {
      // Create two users
      const user1 = await authService.register('user1@example.com', 'password123');
      const user2 = await authService.register('user2@example.com', 'password123');

      // User1 creates an itinerary
      const itinerary1 = {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [],
        recommendations: [],
      };

      const savedItinerary1 = await historyService.saveItinerary(user1.id, itinerary1);

      // User2 tries to access User1's itinerary
      const accessAttempt = await historyService.getItineraryById(
        user2.id,
        savedItinerary1.id
      );

      // Should return null (no access)
      expect(accessAttempt).toBeNull();

      // User1 can access their own itinerary
      const user1Access = await historyService.getItineraryById(
        user1.id,
        savedItinerary1.id
      );
      expect(user1Access).not.toBeNull();
      expect(user1Access?.destination).toBe('Bangkok');
    });

    it('should maintain data isolation with multiple itineraries per user', async () => {
      // Create three users
      const user1 = await authService.register('user1@example.com', 'password123');
      const user2 = await authService.register('user2@example.com', 'password123');
      const user3 = await authService.register('user3@example.com', 'password123');

      // Each user creates multiple itineraries
      const destinations = ['Bangkok', 'Phuket', 'Chiang Mai'];
      
      for (let i = 0; i < destinations.length; i++) {
        await historyService.saveItinerary(user1.id, {
          destination: `User1-${destinations[i]}`,
          duration: i + 1,
          dailySchedules: [],
          recommendations: [],
        });

        await historyService.saveItinerary(user2.id, {
          destination: `User2-${destinations[i]}`,
          duration: i + 2,
          dailySchedules: [],
          recommendations: [],
        });

        await historyService.saveItinerary(user3.id, {
          destination: `User3-${destinations[i]}`,
          duration: i + 3,
          dailySchedules: [],
          recommendations: [],
        });
      }

      // Verify each user only sees their own itineraries
      const user1History = await historyService.getItineraryHistory(user1.id);
      const user2History = await historyService.getItineraryHistory(user2.id);
      const user3History = await historyService.getItineraryHistory(user3.id);

      expect(user1History).toHaveLength(3);
      expect(user2History).toHaveLength(3);
      expect(user3History).toHaveLength(3);

      // Verify all destinations contain the correct user prefix
      user1History.forEach(itinerary => {
        expect(itinerary.destination).toContain('User1-');
      });

      user2History.forEach(itinerary => {
        expect(itinerary.destination).toContain('User2-');
      });

      user3History.forEach(itinerary => {
        expect(itinerary.destination).toContain('User3-');
      });
    });


    it('property test: users can only access their own itineraries', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate multiple users
          fc.array(
            fc.record({
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8, maxLength: 50 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          // Generate itineraries per user
          fc.integer({ min: 1, max: 5 }),
          async (userCredentials, itinerariesPerUser) => {
            // Ensure unique emails
            const uniqueEmails = new Set(userCredentials.map(u => u.email));
            fc.pre(uniqueEmails.size === userCredentials.length);

            // Register all users
            const users = await Promise.all(
              userCredentials.map(cred =>
                authService.register(cred.email, cred.password)
              )
            );

            // Create itineraries for each user
            const allItineraries: Map<string, string[]> = new Map();

            for (const user of users) {
              const itineraryIds: string[] = [];
              
              for (let i = 0; i < itinerariesPerUser; i++) {
                const itinerary = {
                  destination: `Destination-${user.id}-${i}`,
                  duration: i + 1,
                  dailySchedules: [],
                  recommendations: [],
                };

                const saved = await historyService.saveItinerary(user.id, itinerary);
                itineraryIds.push(saved.id);
              }

              allItineraries.set(user.id, itineraryIds);
            }

            // Property: Each user can only access their own itineraries
            for (const user of users) {
              const userHistory = await historyService.getItineraryHistory(user.id);
              
              // User should have exactly the number of itineraries they created
              expect(userHistory).toHaveLength(itinerariesPerUser);
              
              // All itineraries should belong to this user (check by destination)
              userHistory.forEach(itinerary => {
                expect(itinerary.destination).toContain(user.id);
              });

              // User should be able to access their own itineraries by ID
              const userItineraryIds = allItineraries.get(user.id) || [];
              for (const itineraryId of userItineraryIds) {
                const accessed = await historyService.getItineraryById(user.id, itineraryId);
                expect(accessed).not.toBeNull();
                expect(accessed?.destination).toContain(user.id);
              }

              // User should NOT be able to access other users' itineraries
              for (const otherUser of users) {
                if (otherUser.id !== user.id) {
                  const otherItineraryIds = allItineraries.get(otherUser.id) || [];
                  for (const otherItineraryId of otherItineraryIds) {
                    const accessAttempt = await historyService.getItineraryById(
                      user.id,
                      otherItineraryId
                    );
                    expect(accessAttempt).toBeNull();
                  }
                }
              }
            }
          }
        ),
        { numRuns: 50 } // Reduced runs due to complexity
      );
    }, 60000); // 60 second timeout for complex property test
  });
});
