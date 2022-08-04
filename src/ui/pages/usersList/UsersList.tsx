import React, { useEffect, useState } from "react"
import {
  fetchDataAndRedirectIf401,
  getApiUrl,
  ResponseList,
} from "../../../utils"
import NoUsers from "../../components/noUsers/NoUsers"

import UsersListTable, {
  LIST_DEFAULT_LIMIT,
} from "../../components/usersListTable/UsersListTable"
import { User } from "./types"

import "./UsersList.css"

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [offset, setOffset] = useState<number>(0)
  const [nextPaginationToken, setNextPaginationToken] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)

  const loadNextUsers = async (token: string) => {
    if (users[offset + LIST_DEFAULT_LIMIT] == null) {
      const { users: responseUsers, nextPaginationToken } =
        (await loadUsers({ paginationToken: token })) ?? {}
      if (responseUsers) {
        setUsers(users.concat(responseUsers))
        setNextPaginationToken(nextPaginationToken)
      }
      setLoading(false)
    }
    setOffset(offset + LIST_DEFAULT_LIMIT)
  }

  const loadOffset = (offset: number) => setOffset(offset)

  const loadUsers = async (param?: { paginationToken: string }) => {
    setLoading(true)
    const response = await fetchDataAndRedirectIf401({
      url: getApiUrl("/api/users"),
      method: "GET",
      query: { limit: `${LIST_DEFAULT_LIMIT}`, ...param },
    }).catch(() => setLoading(false))
    setLoading(false)
    return response && ((await response?.json()) as ResponseList<User>)
  }

  useEffect(() => {
    loadUsers().then((data) => {
      if (data) {
        const { users, nextPaginationToken } = data ?? {}
        setUsers(users)
        setNextPaginationToken(nextPaginationToken)
      }
    })
  }, [])

  return (
    <div className="users-list">
      <h1 className="users-list-title">User Management</h1>
      <p className="text-small users-list-subtitle">
        One place to manage all your users, revoke access and edit information
        according to your needs.
      </p>

      <div className="users-list-paper">
        {users.length > 0 || loading ? (
          <UsersListTable
            users={users}
            offset={offset}
            nextPaginationToken={nextPaginationToken}
            goToNext={(token) => loadNextUsers(token)}
            offsetChange={loadOffset}
            isLoading={loading}
          />
        ) : (
          <NoUsers />
        )}
      </div>
    </div>
  )
}

export default UsersList
