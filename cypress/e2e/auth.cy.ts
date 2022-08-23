/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { DATA_AUTH_KEY, PATH_API_LOGIN, PATH_USERS, CY_AUTH_FORM } from "./_const"
import { getAppUrl } from "./_utils"

const pageUrl = getAppUrl(PATH_USERS)

describe('Auth', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('shows auth form for un-authenticated users and logins succesfully', () => {
    cy.visit(`${pageUrl}`)
    cy.get(`[data-cy="${CY_AUTH_FORM}"]`).contains('Enter your API Key')

    cy.intercept({
      method: 'POST',
      url: `**${PATH_API_LOGIN}`
    },).as('login')
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').click() 
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').type(DATA_AUTH_KEY)
 
    cy.get('.page-container > .block-container > .api-key-form > .button > span').click()
    cy.wait('@login')
    cy.contains('User Management')
  })

  it('shows auth form for un-authenticated users and fails to login', async () => {

    cy.intercept({
      method: 'POST',
      url: `**${PATH_API_LOGIN}`,
    }, ).as('login')
    cy.visit(`${pageUrl}`)
    
    cy.get(`[data-cy="${CY_AUTH_FORM}"]`).contains('Enter your API Key')
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').click() 
    cy.get('.page-container > .block-container > .api-key-form > .input-field-container > .text-small').type('sdasdsad')
 
    cy.get('.page-container > .block-container > .api-key-form > .button > span').click()
    cy.wait('@login')
    cy.get(`[data-cy="${CY_AUTH_FORM}"] .api-key-form .text-error`).contains('Invalid API Key')
  })
})