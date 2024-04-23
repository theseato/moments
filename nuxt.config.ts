// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({ 
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
  ],  
  css: ["~/assets/css/index.css"],
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
        { src: 'https://notification.randallanjie.com/r_notification.js', type: 'text/javascript', async: true, defer: true },
        { src: `https://recaptcha.net/recaptcha/api.js?render=${process.env.RECAPTCHA_SITE_KEY}`, type: 'text/javascript', async: true, defer: true },
      ]
    }
  },
});
