export enum UserRecipeType { 
  emailpassword= 'emailpassword', 
  thirdparty = "thirdparty", 
  passwordless = "passwordless" }

export type User = { recipeId: UserRecipeType.emailpassword, user: UserEmailPassword } | 
  { recipeId: UserRecipeType.passwordless, user: UserPasswordless } |
  { recipeId: UserRecipeType.thirdparty, user: UserThirdParty }

export interface UserEmailPassword {
  id: string
  email?: string
  phoneNumber?: string
  timeJoined?: number
  firstName?: string
  lastName?: string
}

export interface UserPasswordless extends UserEmailPassword {}

export interface UserThirdParty extends UserEmailPassword {
  thirdParty: {
    id: 'google' | 'github' | string
    userId: string
  }
}
