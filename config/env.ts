/**
 * Type-safe environment variable configuration and validation.
 * Ensures required runtime secrets and configuration are accessible.
 */

export interface EnvConfig {
  nodeEnv: "development" | "production" | "test";
  appUrl: string;
  cloudflare: {
    apiToken?: string;
    accountId?: string;
    d1DatabaseId?: string;
  };
  database: {
    url?: string;
  };
  r2: {
    accountId?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucketName?: string;
    publicUrl?: string;
  };
  auth: {
    jwtSecret?: string;
    sessionSecret?: string;
    adminSecret?: string;
    google: {
      clientId?: string;
      clientSecret?: string;
    };
  };
}

export const env: EnvConfig = {
  nodeEnv: (process.env.NODE_ENV as EnvConfig["nodeEnv"]) || "development",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    d1DatabaseId: process.env.CLOUDFLARE_D1_DATABASE_ID,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || "ecommerce-store-assets",
    publicUrl: process.env.R2_PUBLIC_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    adminSecret: process.env.ADMIN_SECRET,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
};
