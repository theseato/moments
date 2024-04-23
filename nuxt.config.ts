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
        { src: 'https://www.google.com/recaptcha/api.js?render=6LeHIsQpAAAAAJMJVw9NaFZUJsBwA6-22Jz59Emc', type: 'text/javascript', async: true, defer: true },
      ]
    }
  }
});
