// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxtjs/tailwindcss", "nuxt-particles"],

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  runtimeConfig: {
    public: {
      partykitHost: "",
    },
  },
})
