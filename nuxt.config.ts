// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    shim: false
  },

  runtimeConfig: {
    dilovodApiKey: process.env.NUXT_DILOVOD_API_KEY,
    public: {
      apiBaseUrl: process.env.NUXT_API_BASE_URL
    }
  },

  compatibilityDate: '2025-02-14'
});
