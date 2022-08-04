import React from "react";

import { getImageUrl } from "../../../utils";
import { User, UserRecipeType } from "../../pages/usersList/types"
import { formatLongDate } from "../../utils/date"
import NoUsers from "../noUsers/NoUsers"
import PhoneDisplay from "../phoneNumber/PhoneNumber"
import "./UsersListTable.scss"

export const LIST_DEFAULT_LIMIT = 10
interface UserListProps {
  users: User[]
  nextPaginationToken?: string
  isLoading?: boolean
  limit?: number
  offset?: number
  goToNext?: (token: string) => any
  offsetChange?: (offset: number) => any
}

const UsersListTable: React.FC<UserListProps> = (props) => {
  const {
    users,
    limit,
    offset,
    goToNext,
    offsetChange,
    nextPaginationToken,
    isLoading,
  } = { offset: 0, limit: LIST_DEFAULT_LIMIT, ...props }
  const displayedUsers = users.slice(offset, offset + limit)

  return (
    <div className="users-list-table-container">
      <table className="users-list-table">
        <thead>
          <tr>
            <th>User Info</th>
            <th>Auth Method</th>
            <th>Time joined</th>
          </tr>
        </thead>
        <tbody className="text-small">
          {isLoading ? (
            PlaceholderTableRows()
          ) : displayedUsers.length > 0 ? (
            displayedUsers.map((user, index) =>
              UserTableRow({ user: user, index })
            )
          ) : (
            <tr>
              <td>
                <NoUsers />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="user-list-footer">
        {UserListPagination({
          offset,
          limit,
          users,
          isLoading,
          offsetChange,
          nextPaginationToken,
          goToNext,
        })}
      </div>
    </div>
  )

  function PlaceholderTableRows() {
    return new Array(limit).fill(null).map((_, index) => (
      <tr key={index} className="user-row placeholder">
        <td colSpan={3}>
          <div className="user-info"></div>
        </td>
      </tr>
    ))
  }
}

const UserTableRow: React.FC<{ user: User; index?: number }> = (props) => {
  const { user, index } = props
  return (
    <tr key={index} className="user-row">
      <td>{UserInfo(user)}</td>
      <td>{UserRecipePill(user)}</td>
      <td>{UserDate(user)}</td>
    </tr>
  )
}

const UserInfo = (user: User) => {
  const { firstName, lastName, email, phoneNumber: phone } = user.user
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim()
  return (
    <div className="user-info">
      <div className="main">
        {name || email || (phone && PhoneDisplay(phone))}
      </div>
      {email && name && <div>{email}</div>}
      {phone && (name || email) && <div>{PhoneDisplay(phone)}</div>}
    </div>
  )
}

const UserRecipePill = (user: User) => {
  const thirdpartyId =
    user.recipeId === UserRecipeType.thirdparty && user.user.thirdParty.id
  return (
    <div className={`pill ${user.recipeId} ${thirdpartyId}`}>
      {UserRecipeTypeText[user.recipeId]}
      {thirdpartyId && <span> - {thirdpartyId}</span>}
    </div>
  )
}

const UserDate = (user: User) => {
  return (
    <div className="user-date">
      {user.user.timeJoined && formatLongDate(user.user.timeJoined)}
    </div>
  )
}

const UserRecipeTypeText: Record<UserRecipeType, string> = {
  [UserRecipeType.emailpassword]: "Email password",
  [UserRecipeType.passwordless]: "Passwordless",
  [UserRecipeType.thirdparty]: "Third party",
}

const UserListPagination = (props: UserListProps) => {
  const {
    users,
    limit,
    offset,
    goToNext,
    offsetChange,
    nextPaginationToken,
    isLoading,
  } = { offset: 0, limit: LIST_DEFAULT_LIMIT, ...props }
  return (
    <div className="users-list-pagination">
      <p className="users-list-pagination-count text-small">
        {offset + 1}- {offset + limit} of {users.length}
      </p>
      <div className="users-list-pagination-navigation">
        <button
          className="users-list-pagination-button"
          disabled={!offset || isLoading}
          onClick={() =>
            offsetChange && offsetChange(Math.max(offset - limit, 0))
          }
        >
          <img src={getImageUrl("chevron-left.svg")} alt="Previous page" />
        </button>
        <button
          className="users-list-pagination-button"
          disabled={!nextPaginationToken || isLoading}
          onClick={() =>
            goToNext && nextPaginationToken && goToNext(nextPaginationToken)
          }
        >
          <img src={getImageUrl("chevron-right.svg")} alt="Next page" />
        </button>
      </div>
    </div>
  )
}

export default UsersListTable
