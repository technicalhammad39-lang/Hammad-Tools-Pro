const REQUIRED_FIREBASE_PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

type RequiredFirebasePublicEnvKey = (typeof REQUIRED_FIREBASE_PUBLIC_ENV_KEYS)[number];

function readRequiredEnv(key: RequiredFirebasePublicEnvKey) {
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function readOptionalEnv(key: string) {
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

const requiredValues = REQUIRED_FIREBASE_PUBLIC_ENV_KEYS.reduce(
  (accumulator, key) => {
    accumulator[key] = readRequiredEnv(key);
    return accumulator;
  },
  {} as Record<RequiredFirebasePublicEnvKey, string>
);

export const missingFirebasePublicEnvKeys = REQUIRED_FIREBASE_PUBLIC_ENV_KEYS.filter(
  (key) => !requiredValues[key]
);
export const hasFirebasePublicEnv = missingFirebasePublicEnvKeys.length === 0;

let hasLoggedMissingEnv = false;

export function logMissingFirebasePublicEnv(context: string) {
  if (hasFirebasePublicEnv || hasLoggedMissingEnv) {
    return;
  }

  hasLoggedMissingEnv = true;
  console.error(
    `[${context}] Missing required Firebase public env vars: ${missingFirebasePublicEnvKeys.join(', ')}`
  );
}

export const firebaseClientConfig = {
  apiKey: requiredValues.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredValues.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredValues.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: requiredValues.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredValues.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredValues.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: readOptionalEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID') || undefined,
};

export const firestoreDatabaseId =
  readOptionalEnv('NEXT_PUBLIC_FIRESTORE_DATABASE_ID') || '(default)';

export function getFirebasePublicEnvErrorMessage() {
  return 'Authentication is temporarily unavailable. Please try again shortly.';
}

export function getCustomPasswordResetUrl() {
  const value = readOptionalEnv('NEXT_PUBLIC_PASSWORD_RESET_URL');
  if (!value) {
    return null;
  }

  if (!value.startsWith('https://hammadtools.com/reset-password')) {
    console.warn(
      '[firebase-auth] NEXT_PUBLIC_PASSWORD_RESET_URL must start with https://hammadtools.com/reset-password. Falling back to Firebase default email action flow.'
    );
    return null;
  }

  return value;
}
