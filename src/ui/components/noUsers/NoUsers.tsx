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

import { getImageUrl } from "../../../utils";

import "./NoUsers.css";

const NoUsers = (props: { isSearch: boolean }) => {
	return (
		<div className="no-users">
			<img
				src={getImageUrl("no-users-graphic.svg")}
				alt="Orange and blue users"
				className="no-users-image"
			/>

			<p className="no-users-title">
				{!props.isSearch && "Currently, you don't have any users."}
				{props.isSearch && " No search results."}
			</p>
			{!props.isSearch && (
				<p className="no-users-subtitle text-small">
					If you are using just the session management feature of SuperTokens, your users will not appear in
					this list.
				</p>
			)}
		</div>
	);
};

export default NoUsers;
