import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    videosFolder: 'cypress/reports/videos',
    screenshotsFolder: 'cypress/reports/screenshots',
    fixturesFolder: 'cypress/fixtures',
    baseUrl: 'http://localhost:3001',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/json',
      overwrite: false,
      html: true,
      json: true,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
