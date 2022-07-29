import React from "react";

import NoUsers from "../../components/noUsers/NoUsers";
import UsersListTable from "../../components/usersListTable/UsersListTable";

import "./UsersList.css";

const UsersList = () => {

  return (
    <div className="users-list">
      <h1 className="users-list-title">User Management</h1>
      <p className="text-small users-list-subtitle">One place to manage all your users, revoke access and edit information according to your needs.</p>

      <div className="users-list-paper">
        {/* <NoUsers /> */}
        <UsersListTable />
      </div>
    </div>
  );
}

export default UsersList;
