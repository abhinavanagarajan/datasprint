# Clerk Authentication Setup

This project uses Clerk for authentication. Follow these steps to set up authentication:

## 1. Get Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use an existing one
3. Go to the API Keys section
4. Copy your Publishable Key and Secret Key

## 2. Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Replace the placeholder values in `.env.local` with your actual Clerk keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_key_here
   ```

## 3. Authentication Features

### Protected Routes

- All `/patient/*` routes require authentication
- All `/therapist/*` routes require authentication
- Users will be redirected to sign-in if not authenticated

### Authentication Components

- **Sign In**: Available at `/sign-in` or via modal
- **Sign Up**: Available at `/sign-up` or via modal
- **User Button**: Shows user avatar and profile options when signed in
- **Profile Page**: Available at `/profile` (requires authentication)

### Navigation

- Unauthenticated users see a "Sign In" button
- Authenticated users see portal navigation and user avatar
- Different navigation for patient vs therapist routes

## 4. Customization

You can customize Clerk's appearance and behavior by modifying:

- `src/middleware.ts` - Route protection
- Component styling in the `appearance` prop
- Authentication flow redirects in environment variables

## 5. Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`
