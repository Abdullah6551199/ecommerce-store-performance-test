declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly NEXT_PUBLIC_APP_URL?: string;
    readonly DATABASE_URL?: string;
    readonly R2_ACCOUNT_ID?: string;
    readonly R2_ACCESS_KEY_ID?: string;
    readonly R2_SECRET_ACCESS_KEY?: string;
    readonly R2_BUCKET_NAME?: string;
    readonly R2_PUBLIC_URL?: string;
    readonly SESSION_SECRET?: string;
    readonly ADMIN_SECRET?: string;
  }
}
