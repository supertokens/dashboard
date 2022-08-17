import React, { useCallback, useEffect, useState } from 'react'
import { UserListCount, UserPaginationList, UserWithRecipeId } from './types'
import { fetchDataAndRedirectIf401, getApiUrl } from '../../../utils'
import AuthWrapper from '../../components/authWrapper'
import NoUsers from '../../components/noUsers/NoUsers'
import UsersListTable, { LIST_DEFAULT_LIMIT } from '../../components/usersListTable/UsersListTable'
import './UsersList.scss'
import { Footer, LOGO_ICON_LIGHT } from '../../components/footer/footer'

export const UsersList: React.FC = () => {
  const limit = LIST_DEFAULT_LIMIT
  const [count, setCount] = useState<number>()
  const [users, setUsers] = useState<UserWithRecipeId[]>([])
  const [offset, setOffset] = useState<number>(0)
  const [nextPaginationToken, setNextPaginationToken] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true)
  const [errorOffsets, setErrorOffsets] = useState<number[]>([])
  const loadUsers = useCallback(
    async (paginationToken?: string) => {
      setLoading(true)
      const nextOffset = offset + limit
      const newOffset = paginationToken ? nextOffset : offset
      if (!users || users[nextOffset] === undefined) {
        const data = await (paginationToken ? fetchUsers({ paginationToken }) : fetchUsers()).catch(() => undefined)
        if (data) {
          // store the users and pagination token
          const { users: responseUsers, nextPaginationToken } = data
          setUsers(users.concat(responseUsers))
          setNextPaginationToken(nextPaginationToken)
          setErrorOffsets(errorOffsets.filter((item) => item !== nextOffset))
        } else {
          setErrorOffsets([newOffset])
        }
        setLoading(false)
      }
      setOffset(newOffset)
    },
    [offset, users, errorOffsets, limit]
  )
  const loadCount = useCallback(async () => {
    setLoading(true)
    const [countResult] = await Promise.all([fetchCount().catch(() => undefined), loadUsers()])
    if (countResult) {
      setCount(countResult.count)
    }
    setLoading(false)
  }, [])
  const loadOffset = useCallback((offset: number) => setOffset(offset), [])

  useEffect(() => {
    loadCount()
  }, [loadCount])

  return (
    <div className='users-list'>
      <img className='title-image' src={LOGO_ICON_LIGHT} alt='Auth Page' />
      <h1 className='users-list-title'>User Management</h1>
      <p className='text-small users-list-subtitle'>
        One place to manage all your users, revoke access and edit information according to your needs.
      </p>

      <div className='users-list-paper'>
        {users.length === 0 && !loading && !errorOffsets.includes(0) ? (
          <NoUsers />
        ) : (
          <UsersListTable
            users={users}
            offset={offset}
            count={count ?? 0}
            errorOffsets={errorOffsets}
            limit={limit}
            nextPaginationToken={nextPaginationToken}
            goToNext={(token) => loadUsers(token)}
            offsetChange={loadOffset}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  )
}

const fetchUsers = async (param?: { paginationToken?: string; limit?: number }) => {
  const response = await fetchDataAndRedirectIf401({
    url: getApiUrl('/api/users'),
    method: 'GET',
    query: { ...param, limit: `${param?.limit ?? LIST_DEFAULT_LIMIT}` },
  })
  return response.ok ? ((await response?.json()) as UserPaginationList) : undefined
}

const fetchCount = async () => {
  const response = await fetchDataAndRedirectIf401({
    url: getApiUrl('/api/users/count'),
    method: 'GET',
  })

  return response.ok ? ((await response?.json()) as UserListCount) : undefined
}

export const UserListPage = () => (
  <AuthWrapper>
    <UsersList />
    <Footer colorMode='dark' horizontalAlignment='center' verticalAlignment='center' />
  </AuthWrapper>
)
export default UserListPage

