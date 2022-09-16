import { init } from '@sentry/electron/main';
import { app } from 'electron';
import { Integrations } from '@sentry/tracing';

if (process.env.NODE_ENV === 'production') {
  init({
    dsn: 'https://45aa4d5334334f2a93dc2ae9593f1cc4@o1408432.ingest.sentry.io/6743982',
    release: 'tradehood' + app.getVersion(),
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}
