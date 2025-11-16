import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions in production

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // Integrations
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/yourdomain\.com/,
        /^https:\/\/api\.yourdomain\.com/,
      ],
    }),
  ],

  // Filter out common errors
  beforeSend(event, hint) {
    // Filter out network errors
    if (event.exception?.values?.[0]?.type === 'NetworkError') {
      return null;
    }

    // Filter out 404s
    if (event.message?.includes('404')) {
      return null;
    }

    return event;
  },
});
