import { DATA_AUTH_KEY, PATH_USERS, StorageKeys, PATH_API_USERS_LIST } from "./const"
import { userListResponse } from "./mock"
import { getAppUrl } from "./utils"

const pageUrl = getAppUrl(PATH_USERS)
export const isUsersLoaded = () => cy.get(`.user-info .main[title]`)

describe('Users List Page', () => {
  beforeEach(() => {
    localStorage.setItem(StorageKeys.API_KEY, DATA_AUTH_KEY)
  })

  it('show list of users from local API', () => {    
    cy.visit(pageUrl)

    isUsersLoaded().then(() => {
      cy.get('.users-list').contains('User Management')            
    })
  })

  it('show list of users and truncate correctly', () => {
    cy.intercept({url: PATH_API_USERS_LIST}, {
      body: userListResponse 
    }).as('getUsers')
    cy.visit(pageUrl)

    isUsersLoaded().then(() => {
      cy.get('.users-list').contains('User Management')      
      cy.document().then(doc => {
        // is first row email truncated
        const truncatedEmailElement = doc.querySelector(`.user-info .main[title]`)
        expect(Boolean(truncatedEmailElement)).eq(true)
        expect(truncatedEmailElement?.scrollWidth).greaterThan(truncatedEmailElement?.clientWidth ?? 99999)
        // is first row thirdparty pill truncated
        const truncatedPillElement = doc.querySelector(`.pill.thirdparty .thirdparty-name`)
        expect(Boolean(truncatedPillElement)).eq(true)
        expect(truncatedPillElement?.scrollWidth).greaterThan(truncatedPillElement?.clientWidth ?? 99999)
      })
    })
  })
})