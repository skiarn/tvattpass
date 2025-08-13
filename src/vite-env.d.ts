/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_FACEBOOK_GROUP_ID: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
