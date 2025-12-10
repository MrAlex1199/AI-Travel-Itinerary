# AI Travel Itinerary

An AI-powered travel itinerary application that generates personalized daily travel schedules based on user-provided destination and trip duration.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with PT Sans font
- **AI**: Google Gemini via Genkit
- **Testing**: Vitest for unit tests, fast-check for property-based testing

## Project Structure

```
├── app/                 # Next.js App Router pages and layouts
├── components/          # React components
├── lib/                 # Utility functions and helpers
├── services/            # Service layer implementations
├── types/               # TypeScript type definitions
└── .kiro/specs/         # Feature specifications and design documents
```

## Getting Started

### Prerequisites

- Node.js 18.17.1 or higher
- npm 9.6.7 or higher
- A Supabase account and project (for database)
- Google AI API key (for itinerary generation)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your credentials:
   ```
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Database Setup

1. Go to your Supabase project's SQL Editor
2. Run the schema from `lib/db/schema.sql`
3. For development, run `lib/db/disable-rls.sql` to disable Row Level Security
4. See `lib/db/SUPABASE_SETUP.md` for detailed instructions

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Features

- AI-powered itinerary generation using Google Gemini
- User authentication and account management
- Itinerary history and persistence
- Thai language localization
- Clean, modern UI with PT Sans font
- Property-based testing for correctness guarantees

## Requirements

See `.kiro/specs/ai-travel-itinerary/requirements.md` for detailed requirements.

## Design

See `.kiro/specs/ai-travel-itinerary/design.md` for architecture and design details.

## Implementation Plan

See `.kiro/specs/ai-travel-itinerary/tasks.md` for the implementation task list.
