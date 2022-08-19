import { PATH_USERS, URL_ROOT } from "./const"

describe('empty spec', () => {
  it('show auth form for un-authenticated users', () => {
    cy.intercept('/*').as('getLandingPage');
    cy.visit(`${URL_ROOT}${PATH_USERS}`)
  })
})