import React from "react";

import { getImageUrl } from "../../../utils";

import "./NoUsers.css";

const NoUsers = () => {
  return (
    <div className='no-users'>
      <img src={getImageUrl('no-users-graphic.svg')} alt='Orange and blue users' className='no-users-image' />

      <p className='no-users-title'>Currently, you don't have any users</p>
      <p className='no-users-subtitle text-small'>Once added, all users will be found here</p>
      <p className='no-users-subtitle text-small'>
        Users that logged only using the Supertokens' Session Recipe will not be displayed.
      </p>
    </div>
  )
};

export default NoUsers;
