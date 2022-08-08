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

// HTTP requests & responses related 
export type HttpMethod = "GET" | "POST";
export interface ListCount {count: number}
export interface ResponseList<T>  {
    nextPaginationToken?: string
    status: Response['status'],
    users: T[]
}


// Users Models
export enum UserRecipeType { 
  emailpassword= 'emailpassword', 
  thirdparty = "thirdparty", 
  passwordless = "passwordless" }

export type User = { recipeId: UserRecipeType.emailpassword, user: UserEmailPassword } | 
  { recipeId: UserRecipeType.passwordless, user: UserPasswordLess } |
  { recipeId: UserRecipeType.thirdparty, user: UserThirdParty }

export interface UserProperties {
  id: string
  email?: string
  phoneNumber?: string
  timeJoined?: number
  firstName?: string
  lastName?: string
}

export type UserEmailPassword = UserProperties

export type UserPasswordLess = UserProperties

export type UserThirdParty = UserProperties & {
  thirdParty: {
    id: 'google' | 'github' | string
    userId: string
  }
}
