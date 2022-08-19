import { DATA_AUTH_KEY, PATH_API_LOGIN, PATH_USERS, URL_ROOT } from "./const"
import { CY_AUTH_FORM } from "../../src/cy-element-ids"
import { getAppUrl } from "./utils"

const pageUrl = getAppUrl(PATH_USERS)

describe('empty spec', () => {
  it('shows auth form for un-authenticated users and logins succesfully', async () => {
    cy.visit(`${pageUrl}`)
    cy.get(`[data-cy="${CY_AUTH_FORM}"]`)

    cy.intercept(`${getAppUrl(PATH_API_LOGIN)}`).as('login')
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').click() 
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').type(DATA_AUTH_KEY)
 
    cy.get('.page-container > .block-container > .api-key-form > .button > span').click()
    cy.wait('@login').then(() => {
      cy.contains('User Management')
    })
  })

  it('shows auth form for un-authenticated users and fails to login', async () => {
    cy.visit(`${getAppUrl(PATH_USERS)}`)
    cy.get(`[data-cy="${CY_AUTH_FORM}"]`)

    cy.intercept(`${getAppUrl(PATH_API_LOGIN)}`).as('login')
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').click() 
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').type(DATA_AUTH_KEY)
 
    cy.get('.page-container > .block-container > .api-key-form > .button > span').click()
    cy.wait('@login').then(() => {
      cy.contains('User Management')
    })
  })
})