/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEET_ID: string;
  readonly VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly VITE_GOOGLE_PRIVATE_KEY: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
  readonly VITE_CLOUDINARY_API_SECRET: string;
  readonly VITE_SENDGRID_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

