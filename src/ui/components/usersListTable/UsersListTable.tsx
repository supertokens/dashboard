import React from "react";

import { getImageUrl } from "../../../utils";

import "./UsersListTable.css";

const UsersListTable = () => {
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
          <tr>
            <td>John Doe</td>
            <td>Auth Method Pill</td>
            <td>Date and time of joining</td>
          </tr>
          <tr>
            <td>John Doe</td>
            <td>Auth Method Pill</td>
            <td>Date and time of joining</td>
          </tr>
          <tr>
            <td>John Doe</td>
            <td>Auth Method Pill</td>
            <td>Date and time of joining</td>
          </tr>
          <tr>
            <td>John Doe</td>
            <td>Auth Method Pill</td>
            <td>Date and time of joining</td>
          </tr>
          <tr>
            <td>John Doe</td>
            <td>Auth Method Pill</td>
            <td>Date and time of joining</td>
          </tr>
        </tbody>
      </table>

      <div className="users-list-pagination">
        <p className="users-list-pagination-count text-small">
          1-10 of 102
        </p>

        <button className="users-list-pagination-button">
          <img src={getImageUrl("chevron-left.svg")} alt="Previous page" />
        </button>
        <button className="users-list-pagination-button">
          <img src={getImageUrl("chevron-right.svg")} alt="Next page" />
        </button>
      </div>
    </div>
  );
}

export default UsersListTable;
