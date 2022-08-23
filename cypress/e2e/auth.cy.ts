import { DATA_AUTH_KEY, PATH_API_LOGIN, PATH_USERS, CY_AUTH_FORM } from "./const"
import { getAppUrl } from "./utils"

const pageUrl = getAppUrl(PATH_USERS)

describe('Auth', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('shows auth form for un-authenticated users and logins succesfully', () => {
    cy.visit(`${pageUrl}`)
    cy.get(`[data-cy="${CY_AUTH_FORM}"]`).contains('Enter your API Key')

    cy.intercept(`${(PATH_API_LOGIN)}`).as('login')
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').click() 
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').type(DATA_AUTH_KEY)
 
    cy.get('.page-container > .block-container > .api-key-form > .button > span').click()
    cy.wait('@login').its('status').should('eq', 200)
    cy.contains('User Management')
  })

  it('shows auth form for un-authenticated users and fails to login', async () => {

    cy.intercept({
      method: 'POST',
      url: `**${PATH_API_LOGIN}`
    }).as('login')
    cy.visit(`${pageUrl}`)
    
    cy.get(`[data-cy="${CY_AUTH_FORM}"]`).contains('Enter your API Key')
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').click() 
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').type('sdasdsad')
 
    cy.get('.page-container > .block-container > .api-key-form > .button > span').click()
    cy.wait('@login').its('status').should('eq', 401)
    cy.find(`[data-cy="${CY_AUTH_FORM}"] .api-key-form .text-error`).contains('Invalid API Key')
  })
})