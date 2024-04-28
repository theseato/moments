// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  runtimeConfig: {
    public: {
      RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
      TENCENT_MAP_KEY: process.env.TENCENT_MAP_KEY
    },
    private: {
      RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY
    }
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
  ],
  colorMode: {
    classSuffix: "",
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
  app: {
    head: {
      script: [
        { src: `https://recaptcha.net/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`, type: 'text/javascript', async: true, defer: true },
      ]
    }
  },
  plugins: [
    '~/plugins/vue-lazyload.ts',
    '~/plugins/pinia.ts',
  ],
});
