import VueLazyload from 'vue3-lazy'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(VueLazyload, {
    loading: 'path/to/loading.gif',
    error: 'path/to/error.png',
  });
});