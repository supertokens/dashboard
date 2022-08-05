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
  count: number
  nextPaginationToken?: string
  isLoading?: boolean
  limit?: number
  offset?: number
  goToNext?: (token: string) => any
  offsetChange?: (offset: number) => any
}

const UsersListTable: React.FC<UserListProps> = (props) => {
  const { users, limit, offset, isLoading } = {
    offset: 0,
    limit: LIST_DEFAULT_LIMIT,
    ...props,
  }
  const displayedUsers = users.slice(offset, offset + limit)

  return (
    <div className='users-list-table-container'>
      <table className='users-list-table'>
        <thead>
          <tr>
            <th>User Info</th>
            <th>Auth Method</th>
            <th>Time joined</th>
          </tr>
        </thead>
        <tbody className='text-small'>
          {
            isLoading && PlaceholderTableRows(limit, 3, 'user-info') // show placeholder when it is loading from API
          }
          {
            !isLoading && (displayedUsers.length > 0 ? UserTableRows(displayedUsers) : NoUsersRow()) // show rows when it is not loading from API
          }
        </tbody>
      </table>

      <div className='user-list-footer'>
        {UserListPagination({
          ...props,
          offset,
          limit,
        })}
      </div>
    </div>
  )
}

// Table Rows Section
const UserTableRows = (displayedUsers: User[]) => {
  return displayedUsers.map((user, index) => UserTableRow({ user: user, index }))
}

// Single Row Section
const UserTableRow: React.FC<{ user: User; index?: number }> = (props) => {
  const { user, index } = props
  return (
    <tr key={index} className='user-row'>
      <td>{UserInfo(user)}</td>
      <td>{UserRecipePill(user)}</td>
      <td>{UserDate(user)}</td>
    </tr>
  )
}

const UserInfo = (user: User) => {
  const { firstName, lastName, email, phoneNumber: phone } = user.user
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim()
  return (
    <div className='user-info'>
      <div className='main'>{name || email || (phone && PhoneDisplay(phone))}</div>
      {email && name && <div>{email}</div>}
      {phone && (name || email) && <div>{PhoneDisplay(phone)}</div>}
    </div>
  )
}

const UserRecipePill = (user: User) => {
  const thirdpartyId = user.recipeId === UserRecipeType.thirdparty && user.user.thirdParty.id
  return (
    <div className={`pill ${user.recipeId} ${thirdpartyId}`}>
      <span>{UserRecipeTypeText[user.recipeId]}</span>
      {thirdpartyId && <span> - {thirdpartyId}</span>}
    </div>
  )
}

const UserDate = (user: User) => {
  return <div className='user-date'>{user.user.timeJoined && formatLongDate(user.user.timeJoined)}</div>
}

const UserRecipeTypeText: Record<UserRecipeType, string> = {
  [UserRecipeType.emailpassword]: 'Email password',
  [UserRecipeType.passwordless]: 'Passwordless',
  [UserRecipeType.thirdparty]: 'Third party',
}

// Pagination Section
const UserListPagination = (props: UserListProps) => {
  return (
    <div className='users-list-pagination'>
      {UserTablePaginationInfo(props)}
      {UserTablePaginationNavigation(props)}
    </div>
  )
}

const UserTablePaginationInfo = (props: Pick<UserListProps, 'count' | 'limit' | 'offset'>) => {
  const { offset, limit, count } = { offset: 0, limit: LIST_DEFAULT_LIMIT, ...props }
  return (
    <p className='users-list-pagination-count text-small'>
      {offset + 1} - {offset + limit} of {count}
    </p>
  )
}

const UserTablePaginationNavigation = (props: UserListProps) => {
  const { offset, limit, count, isLoading, offsetChange, nextPaginationToken, users, goToNext } = {
    offset: 0,
    limit: LIST_DEFAULT_LIMIT,
    ...props,
  }
  const handleNextPagination = () => {
    return () => {
      // go to some offset if the next page's records is already exist in memory
      if (offset + limit < users.length) {
        offsetChange && offsetChange(offset + limit)
      } else {
        // load next page from API if it has nextPaginationToken
        goToNext && nextPaginationToken && goToNext(nextPaginationToken)
      }
    }
  }

  return (
    <div className='users-list-pagination-navigation'>
      <button
        className='users-list-pagination-button'
        disabled={!offset || isLoading}
        onClick={() => offsetChange && offsetChange(Math.max(offset - limit, 0))}>
        <img src={getImageUrl('chevron-left.svg')} alt='Previous page' />
      </button>
      <button
        className='users-list-pagination-button'
        disabled={(!nextPaginationToken && offset + limit > count) || isLoading}
        onClick={handleNextPagination()}>
        <img src={getImageUrl('chevron-right.svg')} alt='Next page' />
      </button>
    </div>
  )
}

const NoUsersRow = () => {
  return (
    <tr>
      <td>
        <NoUsers />
      </td>
    </tr>
  )
}

const PlaceholderTableRows = (rowCount: number, colSpan: number, className?: string) => {
  return new Array(rowCount).fill(null).map((_, index) => (
    <tr key={index} className='user-row placeholder'>
      <td colSpan={colSpan}>
        <div className={className}></div>
      </td>
    </tr>
  ))
}

export default UsersListTable
