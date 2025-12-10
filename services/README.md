# Services

This directory contains business logic services for the application.

## AuthService

The `AuthService` handles user authentication, including registration, login, session management, and authorization.

### Features

- **User Registration**: Create new user accounts with email and password
- **Password Hashing**: Secure password storage using bcrypt
- **User Login**: Authenticate users with credentials
- **Session Management**: Create and manage user sessions with expiration
- **Session Verification**: Verify active sessions for protected routes
- **Logout**: Invalidate user sessions

### Usage

#### Registration

```typescript
import { AuthService } from '@/services';

const authService = new AuthService();

try {
  const user = await authService.register('user@example.com', 'password123');
  console.log('User registered:', user.email);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

#### Login

```typescript
const session = await authService.login('user@example.com', 'password123');
console.log('Session ID:', session.sessionId);
console.log('Expires at:', session.expiresAt);
```

#### Session Verification

```typescript
const user = await authService.verifySession(sessionId);
if (user) {
  console.log('Valid session for:', user.email);
} else {
  console.log('Invalid or expired session');
}
```

#### Logout

```typescript
await authService.logout(sessionId);
```

### API Routes

The authentication system provides the following API endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/auth/session` - Verify current session

### Middleware

Use the authentication middleware to protect routes:

```typescript
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Unauthorized
  }
  
  const { user } = authResult;
  // Handle authenticated request
}
```

### Protected Routes

The Next.js middleware automatically protects the following routes:
- `/generate` - Itinerary generation page
- `/history` - Itinerary history page

Unauthenticated users will be redirected to `/login`.

### Requirements Satisfied

- **7.2**: User registration with email and password
- **7.3**: Login credential verification
- **7.4**: Session creation on successful authentication
- **7.5**: Authentication rejection for invalid credentials


## ItineraryGenerator

The `ItineraryGenerator` service uses Google Gemini AI via Genkit to generate personalized travel itineraries in Thai language.

### Features

- **AI-Powered Generation**: Uses Google Gemini 1.5 Flash for intelligent itinerary creation
- **Thai Language Output**: All content generated in Thai language
- **Structured Output**: Validates and parses AI responses into typed data structures
- **Error Handling**: Comprehensive error handling with retry logic
- **Timeout Protection**: 30-second timeout to prevent hanging requests
- **Exponential Backoff**: Automatic retry with exponential backoff for transient failures

### Usage

```typescript
import { ItineraryGenerator } from '@/services';

const generator = new ItineraryGenerator();

try {
  const itinerary = await generator.generateItinerary(
    { destination: 'กรุงเทพ', duration: 3 },
    'th'
  );
  
  console.log('Generated itinerary for:', itinerary.destination);
  console.log('Number of days:', itinerary.dailySchedules.length);
  console.log('Recommendations:', itinerary.recommendations.length);
} catch (error) {
  console.error('Generation failed:', error.message);
}
```

### Output Structure

The generated itinerary includes:

- **Daily Schedules**: One schedule per day with activities
  - Each activity has: time, name, location, description
  - Minimum 3 activities per day
- **Recommendations**: Curated suggestions grouped by category
  - Places of interest (category: 'place')
  - Restaurants (category: 'restaurant')
  - Local experiences (category: 'experience')

### Error Handling

The service handles various error scenarios:

- **Timeouts**: Retries up to 3 times with exponential backoff
- **Rate Limiting**: Returns Thai error message with wait time suggestion
- **Malformed Responses**: Attempts to extract and parse JSON from AI output
- **Invalid Structure**: Validates response against Zod schemas

### Configuration

Requires `GOOGLE_AI_API_KEY` environment variable. See `lib/genkit/README.md` for setup instructions.

### Requirements Satisfied

- **2.1**: Generates one schedule per day for trip duration
- **2.2**: Incorporates destination-specific information
- **2.3**: Returns complete itinerary on success
- **2.4**: Returns error messages on failure
- **2.5**: Ensures minimum 3 activities per day
- **10.2**: Generates all content in Thai language
- **11.4**: Uses Google Gemini via Genkit framework
