/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { UserWithRecipeId } from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import PhoneDisplay from "../phoneNumber/PhoneNumber";
import { UserDetailProps } from "./userDetail";

const getBadgeInitial = ({ user, recipeId }: UserWithRecipeId) => {
  const { firstName, lastName, email, id } = user;
  // concatting the firstName & lastname to handle 
  // the case if user enters full name in either firstname or last name
  const fullName = (`${firstName} ${lastName}`).trim();
  if (fullName?.length > 0) {
    const splitFullName = fullName.split(" ");
    return splitFullName.length > 1 ? `${splitFullName[0][0]}${splitFullName[1][0]}` : splitFullName[0].slice(0, 1)
  }
  if (email !== undefined && email.trim().length > 0 ) { return email.trim().split("@")[0].slice(0, 1) }
  if (recipeId === 'passwordless' && user.phoneNumber !== undefined && user.phoneNumber.trim().length > 0 ) {
    return user.phoneNumber.trim().slice(0, 1);
  }
  if (recipeId === 'thirdparty' && user.thirdParty.userId.trim().length > 0) {
    return user.thirdParty.userId.trim().slice(0, 1);
  }
  return id.trim().slice(0, 1)
}

export const UserDetailBadge: React.FC<{user: UserWithRecipeId}> = ({ user }) => 
  <div className="user-detail__header__badge">{getBadgeInitial(user)}</div>

export const UserDetailHeader: React.FC<UserDetailProps> = ({ user, onDeleteCallback }) => {
  const { firstName, lastName, email, id } = user.user
  const phone = user.recipeId === 'passwordless' ? user.user.phoneNumber : undefined
  const thirdPartyUserId = user.recipeId === 'thirdparty' ? user.user.thirdParty.userId : undefined 
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim()
  return <div className="user-detail__header">
    <UserDetailBadge user={user} />
    <div className="user-detail__header__info">
      <div className="user-detail__header__title">
        {fullName || email || thirdPartyUserId || (phone && <PhoneDisplay phone={phone} />)}
      </div>
      <div className="user-detail__header__user-id">
        <span>User ID:</span>
        <span className="block-snippet"><CopyText>{id}</CopyText></span>
      </div>
    </div>
    { onDeleteCallback && <div className="user-detail__header__action"></div> }
  </div>
}

export default UserDetailHeader;
