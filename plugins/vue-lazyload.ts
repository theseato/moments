import VueLazyload from 'vue3-lazy'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(VueLazyload, {
    loading: '/loader.svg',
  });
});