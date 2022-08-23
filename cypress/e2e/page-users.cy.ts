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

import { DATA_AUTH_KEY, PATH_USERS, StorageKeys, PATH_API_USERS_LIST } from "./_const"
import { userListResponse } from "./_mock"
import { getAppUrl } from "./_utils"

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