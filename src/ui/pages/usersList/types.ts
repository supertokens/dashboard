import { HttpApiBaseResponse } from '../../../types'

export type UserListCount = HttpApiBaseResponse & { count: number }
export type UserPaginationList = HttpApiBaseResponse & {
  nextPaginationToken?: string
  users: UserWithRecipeId[]
}

// Users Models
export type EmailPasswordRecipeId = 'emailpassword'
export type ThirdPartyRecipeId = 'thirdparty'
export type PasswordlessRecipeId = 'passwordless'

export type UserRecipeType = EmailPasswordRecipeId | ThirdPartyRecipeId | PasswordlessRecipeId

export type UserWithRecipeId =
  | { recipeId: EmailPasswordRecipeId; user: UserEmailPassword }
  | { recipeId: PasswordlessRecipeId; user: UserPasswordLess }
  | { recipeId: ThirdPartyRecipeId; user: UserThirdParty }

export type User = {
  id: string
  email?: string
  timeJoined: number
  firstName?: string
  lastName?: string
}

export type UserEmailPassword = User

export type UserPasswordLess = User & { phoneNumber?: string }

export type UserThirdParty = User & {
  thirdParty: {
    id: 'google' | 'github' | 'apple' | 'facebook' | string
    userId: string
  }
}
