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

import { FC } from "react";
import { getImageUrl } from "../../../utils";
import { User } from "../../pages/usersList/types";

export type UserRowMenuProps = {
	menuItems: UserRowMenuItemProps[];
	user: User;
};

export type UserRowMenuItemProps = {
	onClick: () => void;
	text: string;
	imageUrl: string;
	hoverImageUrl?: string;
	className?: string;
	disabled?: (user: User) => boolean;
};

export const UserRowMenuItem: FC<UserRowMenuItemProps> = ({ imageUrl, hoverImageUrl, text, onClick, className }) => (
	<>
		<button
			className={`user-row-select-popup-item button flat ${className}`}
			onClick={onClick}>
			<img
				className="img-normal"
				src={getImageUrl(imageUrl)}
				alt={text}
			/>
			<img
				className="img-hover"
				src={getImageUrl(hoverImageUrl ?? imageUrl)}
				alt={text}
			/>
			<span>{text}</span>
		</button>
	</>
);

export const UserRowMenu: FC<UserRowMenuProps> = ({ user, menuItems }) => {
	return (
		<>
			<div className="user-row-select-menu">
				<button className="user-row-select-button">
					<img
						src={getImageUrl("chevron-down.svg")}
						alt="Open user detail"
						className="img-normal"
					/>

					<img
						src={getImageUrl("chevron-up-selected.svg")}
						alt="Open user detail"
						className="img-hover"
					/>
				</button>
				<div className="user-row-select-popup">
					<div className="panel">
						{menuItems.map((menu) =>
							menu.disabled === undefined || !menu.disabled(user) ? (
								<UserRowMenuItem
									{...menu}
									key={menu.text}
								/>
							) : null
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default UserRowMenu;
