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
