# Implementation Plan

- [x] 1. Initialize Next.js project with TypeScript and dependencies





  - Create Next.js 14+ project with App Router
  - Install and configure TypeScript, Tailwind CSS, Genkit, fast-check, Vitest
  - Configure PT Sans font in Tailwind config
  - Set up project structure: app/, components/, lib/, services/, types/
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 2. Set up database schema and models





  - Create database schema for users, itineraries, daily_schedules, activities, recommendations tables
  - Implement TypeScript interfaces for User, Itinerary, DailySchedule, Activity, Recommendation
  - Create database connection utilities
  - Implement repository pattern for data access
  - _Requirements: 8.1, 8.2_

- [x] 2.1 Write property test for data persistence






  - **Property 19: Itinerary storage round-trip**
  - **Validates: Requirements 8.1, 8.2, 9.2**


- [x] 3. Implement authentication system




  - Set up NextAuth.js or similar authentication library
  - Create user registration endpoint with password hashing
  - Create login endpoint with credential verification
  - Implement session management
  - Create protected route middleware
  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 3.1 Write property test for registration






  - **Property 15: Registration creates user accounts**
  - **Validates: Requirements 7.2**

- [x] 3.2 Write property test for login verification






  - **Property 16: Login verifies credentials**
  - **Validates: Requirements 7.3**

- [x] 3.3 Write property test for session creation






  - **Property 17: Successful authentication creates session**
  - **Validates: Requirements 7.4**

- [x] 3.4 Write property test for authentication rejection






  - **Property 18: Failed authentication rejects access**
  - **Validates: Requirements 7.5**

- [x] 4. Create Thai language localization system





  - Create Thai language translation files for all UI text
  - Implement localization utility functions
  - Configure date/time formatting for Thai locale
  - Create validation error messages in Thai
  - Create authentication messages in Thai
  - _Requirements: 10.1, 10.3, 10.4, 10.5_

- [x] 4.1 Write property test for UI localization






  - **Property 23: UI elements are displayed in Thai**
  - **Validates: Requirements 10.1**

- [x] 4.2 Write property test for validation error localization






  - **Property 25: Validation errors are in Thai**
  - **Validates: Requirements 10.3**

- [x] 4.3 Write property test for auth message localization






  - **Property 26: Authentication messages are in Thai**
  - **Validates: Requirements 10.4**


- [x] 4.4 Write property test for date formatting





  - **Property 27: Dates use Thai locale formatting**
  - **Validates: Requirements 10.5**

- [x] 5. Build authentication UI components





  - Create AuthForm component with login/register modes
  - Implement form validation for email and password
  - Add loading states and error displays
  - Create login page (/login)
  - Create register page (/register)
  - Style with Tailwind CSS and PT Sans font
  - _Requirements: 7.1, 10.1_

- [x] 6. Implement Genkit AI integration for itinerary generation





  - Set up Genkit with Google Gemini configuration
  - Create prompt template requesting Thai language output
  - Implement structured output parsing for itineraries
  - Create ItineraryGenerator service with generateItinerary method
  - Add error handling for AI failures (timeout, rate limiting, malformed responses)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 11.4_

- [x] 6.1 Write property test for itinerary duration matching






  - **Property 4: Generated itineraries match requested duration**
  - **Validates: Requirements 2.1**

- [x] 6.2 Write property test for minimum activities






  - **Property 5: Each daily schedule contains minimum activities**
  - **Validates: Requirements 2.5**

- [x] 6.3 Write property test for complete itinerary return






  - **Property 6: Successful generation returns complete itinerary**
  - **Validates: Requirements 2.3**

- [x] 6.4 Write property test for AI content localization






  - **Property 24: AI-generated content is in Thai**
  - **Validates: Requirements 10.2**

- [x] 6.5 Write property test for recommendation categories






  - **Property 10: Recommendations include required categories**
  - **Validates: Requirements 4.1, 4.2**

- [x] 7. Create destination input form component




  - Build DestinationForm component with destination and duration inputs
  - Implement client-side validation (non-empty destination, duration >= 1)
  - Add Thai validation error messages
  - Create loading state during submission
  - Style with Tailwind CSS, PT Sans font, and modern icons
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 5.2, 5.5_

- [x] 7.1 Write property test for destination validation






  - **Property 1: Destination validation accepts non-empty strings**
  - **Validates: Requirements 1.2**

- [x] 7.2 Write property test for duration validation









  - **Property 2: Duration validation accepts positive integers**
  - **Validates: Requirements 1.3**

- [x] 7.3 Write property test for invalid input prevention






  - **Property 3: Invalid inputs prevent form submission**
  - **Validates: Requirements 1.5**

- [x] 8. Create API route for itinerary generation





  - Create POST /api/itinerary endpoint
  - Validate request body (destination, duration)
  - Call ItineraryGenerator service
  - Save generated itinerary to database with user association
  - Return itinerary JSON response
  - Handle errors with Thai error messages
  - _Requirements: 1.4, 2.3, 8.1, 8.3_

- [x] 8.1 Write property test for timestamp recording






  - **Property 20: Stored itineraries include timestamps**
  - **Validates: Requirements 8.3**

- [x] 9. Build itinerary display components





  - Create ItineraryDisplay component as main container
  - Create ActivitySchedule component for daily schedules
  - Create Activity card component with time, name, location, description
  - Create RecommendationList component grouped by category
  - Implement chronological ordering of days
  - Ensure consistent time formatting (12-hour or 24-hour)
  - Add smooth transition animations (<= 500ms)
  - Style with Tailwind CSS, PT Sans font, adequate whitespace
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.4, 4.5, 5.1, 5.2, 5.4_

- [x] 9.1 Write property test for activity field rendering






  - **Property 7: Activity rendering includes all required fields**
  - **Validates: Requirements 3.1, 3.3**

- [x] 9.2 Write property test for chronological ordering






  - **Property 8: Daily schedules are ordered chronologically**
  - **Validates: Requirements 3.2**

- [x] 9.3 Write property test for time format consistency






  - **Property 9: Time formatting is consistent**
  - **Validates: Requirements 3.5**

- [x] 9.4 Write property test for recommendation rendering






  - **Property 11: Recommendation rendering includes name and description**
  - **Validates: Requirements 4.4**

- [x] 9.5 Write property test for recommendation grouping






  - **Property 12: Recommendations are grouped by category**
  - **Validates: Requirements 4.5**

- [x] 9.6 Write property test for animation duration limits






  - **Property 13: Animation durations do not exceed limit**
  - **Validates: Requirements 5.4**

- [x] 10. Create main itinerary generation page





  - Create /generate page with DestinationForm
  - Implement form submission handler calling /api/itinerary
  - Display loading indicator during generation
  - Show ItineraryDisplay component when generation completes
  - Add smooth appearance animation for itinerary content
  - Handle and display errors with Thai messages and appropriate styling
  - Protect route with authentication middleware
  - _Requirements: 1.4, 6.1, 6.4, 6.5_

- [x] 10.1 Write property test for error message display






  - **Property 14: Error messages are displayed with styling**
  - **Validates: Requirements 6.5**

- [x] 11. Implement itinerary history service





  - Create HistoryService with saveItinerary, getItineraryHistory, getItineraryById methods
  - Implement database queries filtering by userId
  - Implement reverse chronological ordering by generation timestamp
  - Add authorization checks to ensure users only access their own data
  - _Requirements: 8.4, 8.5, 9.5_

- [x] 11.1 Write property test for user isolation






  - **Property 21: History retrieval returns only user's itineraries**
  - **Validates: Requirements 8.4, 9.1, 9.5**

- [x] 11.2 Write property test for history ordering






  - **Property 22: History is ordered reverse chronologically**
  - **Validates: Requirements 8.5, 9.3**

- [x] 12. Create itinerary history UI








  - Create /history page displaying list of user's itineraries
  - Show destination, duration, and generation date for each entry
  - Implement empty state message in Thai when no itineraries exist
  - Add click handler to view full itinerary details
  - Create /history/[id] page displaying complete historical itinerary
  - Protect routes with authentication middleware
  - Style with Tailwind CSS and PT Sans font
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 13. Add navigation and layout









  - Create main layout component with navigation menu
  - Add links to: Generate Itinerary, History, Logout
  - Display user email in navigation when logged in
  - Add hover effects and visual feedback for interactive elements
  - Implement smooth transitions between pages
  - Style with clean, spacious layout and PT Sans font
  - _Requirements: 5.1, 5.2, 5.3, 6.2, 6.3_

- [x] 14. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Polish UI and animations





  - Review all animations for smoothness and timing
  - Ensure consistent spacing and whitespace throughout
  - Verify PT Sans font is applied to all text elements
  - Add icons to activities and locations
  - Test responsive design on different screen sizes
  - Verify all Thai text displays correctly
  - _Requirements: 5.1, 5.2, 5.5, 6.2_

- [x] 16. Final integration testing






  - Test complete user flow: register → login → generate itinerary → view history
  - Test error scenarios: invalid inputs, AI failures, network errors
  - Verify authentication protection on all protected routes
  - Test concurrent user sessions
  - Verify data isolation between users
