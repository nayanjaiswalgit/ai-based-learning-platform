import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Debug mode
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],

  // Filter sensitive data
  beforeSend(event) {
    // Remove PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data?.password) {
          breadcrumb.data.password = '[Filtered]';
        }
        if (breadcrumb.data?.token) {
          breadcrumb.data.token = '[Filtered]';
        }
        return breadcrumb;
      });
    }

    return event;
  },
});
