/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEET_ID: string;
  // Note: Google service account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) 
  // should NOT be prefixed with VITE_ as they are only used in serverless functions, not in the browser
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  // Note: Cloudinary API key and secret are not needed for unsigned uploads with upload presets
  // The cloud name is safe to expose as it's public information (appears in all Cloudinary URLs)
  readonly VITE_SENDGRID_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

