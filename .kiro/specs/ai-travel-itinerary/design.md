# Design Document

## Overview

The AI-powered travel itinerary application is a web-based system that generates personalized travel plans using Google Gemini AI. The application consists of a Next.js frontend with TypeScript and Tailwind CSS, an authentication system for user management, a database for persistent storage, and an AI integration layer using Genkit. The system accepts user input (destination and trip duration), generates comprehensive daily itineraries with activities and recommendations, and stores them for future reference. All content is presented in Thai language to serve Thai-speaking users.

## Architecture

The application follows a layered architecture pattern with clear separation of concerns:

### Presentation Layer (Next.js + React)
- **Pages/Routes**: Landing page, authentication pages (login/register), itinerary generation form, itinerary display, history view
- **Components**: Form inputs, activity cards, recommendation lists, navigation, loading states, error displays
- **State Management**: React hooks for local state, session management for authentication state
- **Styling**: Tailwind CSS utility classes with custom configuration for PT Sans font and brand colors

### Application Layer
- **Authentication Service**: Handles user registration, login, session management, and authorization
- **Itinerary Service**: Orchestrates itinerary generation requests and coordinates between AI and database
- **History Service**: Manages retrieval and display of saved itineraries

### AI Integration Layer (Genkit + Gemini)
- **Prompt Engineering**: Structured prompts that request Thai language output with specific formatting
- **Response Parsing**: Extracts structured itinerary data from AI responses
- **Error Handling**: Manages AI service failures and fallback strategies

### Data Layer
- **Database**: Stores user accounts, authentication credentials, and itinerary history
- **Models**: User, Itinerary, Activity, Recommendation entities
- **Repository Pattern**: Abstracts database operations for testability

### Technology Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **AI**: Google Gemini via Genkit framework
- **Database**: PostgreSQL or similar relational database
- **Authentication**: NextAuth.js or similar authentication library
- **Deployment**: Vercel or similar Next.js-optimized platform

## Components and Interfaces

### User Interface Components

#### DestinationForm Component
```typescript
interface DestinationFormProps {
  onSubmit: (data: TripInput) => Promise<void>;
  isLoading: boolean;
}

interface TripInput {
  destination: string;
  duration: number; // days
}
```

#### ItineraryDisplay Component
```typescript
interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSave?: () => void;
}

interface Itinerary {
  id: string;
  destination: string;
  duration: number;
  dailySchedules: DailySchedule[];
  recommendations: Recommendation[];
  generatedAt: Date;
}
```

#### ActivitySchedule Component
```typescript
interface ActivityScheduleProps {
  schedule: DailySchedule;
  dayNumber: number;
}

interface DailySchedule {
  day: number;
  activities: Activity[];
}

interface Activity {
  time: string; // HH:mm format
  name: string;
  location: string;
  description: string;
  icon?: string;
}
```

#### RecommendationList Component
```typescript
interface RecommendationListProps {
  recommendations: Recommendation[];
}

interface Recommendation {
  id: string;
  category: 'place' | 'restaurant' | 'experience';
  name: string;
  description: string;
  location?: string;
}
```

#### AuthForm Component
```typescript
interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (credentials: AuthCredentials) => Promise<void>;
  error?: string;
}

interface AuthCredentials {
  email: string;
  password: string;
}
```

### Service Interfaces

#### ItineraryGenerator Service
```typescript
interface IItineraryGenerator {
  generateItinerary(input: TripInput, locale: string): Promise<Itinerary>;
}
```

#### Authentication Service
```typescript
interface IAuthService {
  register(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<AuthSession>;
  logout(sessionId: string): Promise<void>;
  verifySession(sessionId: string): Promise<User | null>;
}

interface AuthSession {
  sessionId: string;
  user: User;
  expiresAt: Date;
}
```

#### History Service
```typescript
interface IHistoryService {
  saveItinerary(userId: string, itinerary: Itinerary): Promise<void>;
  getItineraryHistory(userId: string): Promise<Itinerary[]>;
  getItineraryById(userId: string, itineraryId: string): Promise<Itinerary | null>;
}
```

### AI Integration Interface

#### Genkit Flow
```typescript
interface GeminiPromptInput {
  destination: string;
  duration: number;
  language: string;
}

interface GeminiResponse {
  dailySchedules: Array<{
    day: number;
    activities: Array<{
      time: string;
      name: string;
      location: string;
      description: string;
    }>;
  }>;
  recommendations: Array<{
    category: string;
    name: string;
    description: string;
    location?: string;
  }>;
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Itinerary Model
```typescript
interface Itinerary {
  id: string;
  userId: string;
  destination: string;
  duration: number;
  dailySchedules: DailySchedule[];
  recommendations: Recommendation[];
  generatedAt: Date;
}

interface DailySchedule {
  day: number;
  activities: Activity[];
}

interface Activity {
  time: string;
  name: string;
  location: string;
  description: string;
  icon?: string;
}

interface Recommendation {
  id: string;
  category: 'place' | 'restaurant' | 'experience';
  name: string;
  description: string;
  location?: string;
}
```

### Database Schema

#### users table
- id (UUID, primary key)
- email (VARCHAR, unique, not null)
- password_hash (VARCHAR, not null)
- created_at (TIMESTAMP, not null)
- updated_at (TIMESTAMP, not null)

#### itineraries table
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- destination (VARCHAR, not null)
- duration (INTEGER, not null)
- generated_at (TIMESTAMP, not null)

#### daily_schedules table
- id (UUID, primary key)
- itinerary_id (UUID, foreign key to itineraries.id)
- day (INTEGER, not null)

#### activities table
- id (UUID, primary key)
- daily_schedule_id (UUID, foreign key to daily_schedules.id)
- time (VARCHAR, not null)
- name (TEXT, not null)
- location (TEXT, not null)
- description (TEXT, not null)
- icon (VARCHAR, nullable)
- order_index (INTEGER, not null)

#### recommendations table
- id (UUID, primary key)
- itinerary_id (UUID, foreign key to itineraries.id)
- category (VARCHAR, not null)
- name (TEXT, not null)
- description (TEXT, not null)
- location (TEXT, nullable)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Input Validation Properties

**Property 1: Destination validation accepts non-empty strings**
*For any* string input to the destination field, if the string has at least 1 character, then the validation should accept it
**Validates: Requirements 1.2**

**Property 2: Duration validation accepts positive integers**
*For any* numeric input to the duration field, if the value is >= 1, then the validation should accept it, and if the value is < 1, then the validation should reject it
**Validates: Requirements 1.3**

**Property 3: Invalid inputs prevent form submission**
*For any* form submission with empty destination or duration < 1, the form should prevent submission and display validation error messages
**Validates: Requirements 1.5**

### Itinerary Generation Properties

**Property 4: Generated itineraries match requested duration**
*For any* valid destination and duration input, the generated itinerary should contain exactly the same number of daily schedules as the requested duration
**Validates: Requirements 2.1**

**Property 5: Each daily schedule contains minimum activities**
*For any* generated itinerary, every daily schedule should contain at least 3 activities
**Validates: Requirements 2.5**

**Property 6: Successful generation returns complete itinerary**
*For any* valid input that successfully generates, the returned itinerary should contain destination, duration, daily schedules, and recommendations
**Validates: Requirements 2.3**

### Display and Formatting Properties

**Property 7: Activity rendering includes all required fields**
*For any* activity being rendered, the displayed output should contain the time, activity name, and location
**Validates: Requirements 3.1, 3.3**

**Property 8: Daily schedules are ordered chronologically**
*For any* itinerary with multiple days, the displayed daily schedules should be ordered by day number in ascending order (day 1, day 2, day 3, ...)
**Validates: Requirements 3.2**

**Property 9: Time formatting is consistent**
*For any* itinerary, all activity times should use the same time format (either all 12-hour or all 24-hour format)
**Validates: Requirements 3.5**

**Property 10: Recommendations include required categories**
*For any* generated itinerary, the recommendations should include at least one place of interest and at least one restaurant
**Validates: Requirements 4.1, 4.2**

**Property 11: Recommendation rendering includes name and description**
*For any* recommendation being rendered, the displayed output should contain both the name and description fields
**Validates: Requirements 4.4**

**Property 12: Recommendations are grouped by category**
*For any* list of recommendations being displayed, recommendations with the same category should be grouped together
**Validates: Requirements 4.5**

**Property 13: Animation durations do not exceed limit**
*For any* view transition animation, the animation duration should not exceed 500 milliseconds
**Validates: Requirements 5.4**

**Property 14: Error messages are displayed with styling**
*For any* error that occurs, the UI should display an error message with appropriate visual styling
**Validates: Requirements 6.5**

### Authentication Properties

**Property 15: Registration creates user accounts**
*For any* valid email and password combination, calling the registration function should create a new user account with those credentials
**Validates: Requirements 7.2**

**Property 16: Login verifies credentials**
*For any* login attempt, the authentication system should verify the provided credentials against stored user data and return success only if they match
**Validates: Requirements 7.3**

**Property 17: Successful authentication creates session**
*For any* successful login, the authentication system should create a session and grant access to protected features
**Validates: Requirements 7.4**

**Property 18: Failed authentication rejects access**
*For any* invalid credentials, the authentication system should reject access and display an error message
**Validates: Requirements 7.5**

### Data Persistence Properties

**Property 19: Itinerary storage round-trip**
*For any* generated itinerary that is saved to the database, retrieving it by ID should return an itinerary with the same destination, duration, activities, and recommendations
**Validates: Requirements 8.1, 8.2, 9.2**

**Property 20: Stored itineraries include timestamps**
*For any* itinerary saved to the database, the stored record should include a generation timestamp
**Validates: Requirements 8.3**

**Property 21: History retrieval returns only user's itineraries**
*For any* user requesting their history, the returned itineraries should only include itineraries where the userId matches the authenticated user's ID
**Validates: Requirements 8.4, 9.1, 9.5**

**Property 22: History is ordered reverse chronologically**
*For any* user's itinerary history, the itineraries should be ordered by generation timestamp in descending order (newest first)
**Validates: Requirements 8.5, 9.3**

### Localization Properties

**Property 23: UI elements are displayed in Thai**
*For any* UI element (label, button, heading, message), the displayed text should be in Thai language
**Validates: Requirements 10.1**

**Property 24: AI-generated content is in Thai**
*For any* generated itinerary, all activity descriptions, location names, and recommendations should be in Thai language
**Validates: Requirements 10.2**

**Property 25: Validation errors are in Thai**
*For any* form validation error, the error message should be displayed in Thai language
**Validates: Requirements 10.3**

**Property 26: Authentication messages are in Thai**
*For any* authentication-related message or prompt, the text should be displayed in Thai language
**Validates: Requirements 10.4**

**Property 27: Dates use Thai locale formatting**
*For any* date or time displayed in the UI, the formatting should follow Thai locale conventions
**Validates: Requirements 10.5**

## Error Handling

### Input Validation Errors
- **Empty destination**: Display Thai error message "กรุณากรอกจุดหมายปลายทาง" (Please enter destination)
- **Invalid duration**: Display Thai error message "กรุณากรอกจำนวนวันที่ถูกต้อง (ตั้งแต่ 1 วันขึ้นไป)" (Please enter valid duration, 1 day or more)
- **Network errors during submission**: Display Thai error message with retry option

### AI Generation Errors
- **API timeout**: Retry up to 3 times with exponential backoff, then display Thai error message
- **Invalid AI response**: Log error, attempt to parse partial data, or display error message requesting user to try again
- **Rate limiting**: Display Thai message indicating temporary unavailability with estimated wait time
- **Malformed JSON from AI**: Implement robust parsing with fallback to manual extraction

### Authentication Errors
- **Invalid credentials**: Display Thai message "อีเมลหรือรหัสผ่านไม่ถูกต้อง" (Invalid email or password)
- **Email already exists**: Display Thai message "อีเมลนี้ถูกใช้งานแล้ว" (This email is already in use)
- **Session expired**: Redirect to login page with Thai message
- **Weak password**: Display Thai message with password requirements

### Database Errors
- **Connection failure**: Retry with exponential backoff, display Thai error message if persistent
- **Query timeout**: Implement query timeout limits, display Thai error message
- **Constraint violations**: Handle gracefully with appropriate Thai error messages
- **Data integrity errors**: Log for investigation, display generic Thai error to user

### General Error Handling Strategy
- All errors should be logged with sufficient context for debugging
- User-facing error messages should always be in Thai
- Provide actionable guidance when possible (e.g., "Try again" button)
- Never expose internal system details or stack traces to users
- Implement error boundaries in React to catch rendering errors
- Use try-catch blocks around all async operations

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the unit testing framework for TypeScript/JavaScript code. Unit tests will focus on:

**Component Testing:**
- Form validation logic (destination and duration inputs)
- Activity and recommendation rendering with various data shapes
- Authentication form behavior
- Error message display
- Loading state transitions

**Service Layer Testing:**
- Authentication service methods (register, login, logout, session verification)
- History service CRUD operations
- Data transformation and formatting functions
- Thai language text utilities

**Integration Testing:**
- API route handlers
- Database operations with test database
- AI service integration with mocked Gemini responses
- End-to-end authentication flows

**Edge Cases:**
- Empty itinerary history display
- Single-day trips
- Maximum duration limits
- Special characters in destination names
- Concurrent user sessions

### Property-Based Testing

The application will use **fast-check** as the property-based testing library for JavaScript/TypeScript. Property-based tests will verify universal properties across randomly generated inputs:

**Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Tests will use custom generators for domain-specific data (destinations, activities, users)
- Each test will be tagged with a comment referencing the design document property

**Property Test Coverage:**
- Input validation properties (Properties 1-3)
- Itinerary generation properties (Properties 4-6)
- Display and formatting properties (Properties 7-14)
- Authentication properties (Properties 15-18)
- Data persistence properties (Properties 19-22)
- Localization properties (Properties 23-27)

**Test Tagging Format:**
Each property-based test will include a comment in this exact format:
```typescript
// Feature: ai-travel-itinerary, Property 4: Generated itineraries match requested duration
```

**Custom Generators:**
- `arbitraryDestination()`: Generates valid destination strings
- `arbitraryDuration()`: Generates valid trip durations (1-30 days)
- `arbitraryActivity()`: Generates activity objects with Thai text
- `arbitraryUser()`: Generates user credentials
- `arbitraryItinerary()`: Generates complete itinerary objects

**Example Property Test:**
```typescript
// Feature: ai-travel-itinerary, Property 4: Generated itineraries match requested duration
test('generated itineraries match requested duration', () => {
  fc.assert(
    fc.property(
      arbitraryDestination(),
      arbitraryDuration(),
      async (destination, duration) => {
        const itinerary = await generateItinerary({ destination, duration }, 'th');
        expect(itinerary.dailySchedules.length).toBe(duration);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Testing Approach

1. **Implementation-First Development**: Implement features before writing corresponding tests
2. **Complementary Testing**: Use both unit tests for specific examples and property tests for universal rules
3. **Early Validation**: Run tests frequently during development to catch issues early
4. **Test Data**: Use realistic Thai language test data for localization testing
5. **Mocking Strategy**: Mock external services (Gemini AI) for unit tests, use real services for integration tests
6. **Coverage Goals**: Aim for >80% code coverage with focus on critical paths

