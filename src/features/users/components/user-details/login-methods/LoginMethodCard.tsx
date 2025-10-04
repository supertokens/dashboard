/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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

import { useState } from "react";

import Paper from "@shared/components/paper";
import Separator from "@shared/components/separator";

import { LoginMethod } from "@features/users/types";
import { DeleteLoginMethodModal, UnlinkLoginMethodModal, EditLoginMethodModal } from "../modals";

import LoginMethodHeader from "./LoginMethodHeader";
import LoginMethodContent from "./LoginMethodContent";

import styles from "./LoginMethodCard.module.scss";

interface LoginMethodCardProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
	readonly showUnlink: boolean;
}

export default function LoginMethodCard({ loginMethod, userId, showUnlink }: LoginMethodCardProps) {
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openUnlinkModal, setOpenUnlinkModal] = useState(false);

	return (
		<Paper
			p="0"
			m="4"
			className={styles["login-method-card"]}
			withBackground>
			<LoginMethodHeader
				loginMethod={loginMethod}
				onDelete={() => setOpenDeleteModal(true)}
				onUnlink={() => setOpenUnlinkModal(true)}
				showUnlink={showUnlink}
			/>
			<Separator fullWidth />
			<LoginMethodContent
				loginMethod={loginMethod}
				userId={userId}
				onEditClick={() => setOpenEditModal(true)}
			/>

			<EditLoginMethodModal
				open={openEditModal}
				handleClose={() => setOpenEditModal(false)}
				loginMethod={loginMethod}
				userId={userId}
			/>

			<DeleteLoginMethodModal
				open={openDeleteModal}
				handleClose={() => setOpenDeleteModal(false)}
				loginMethod={loginMethod}
				userId={userId}
				isOnlyLoginMethod={false}
			/>

			<UnlinkLoginMethodModal
				open={openUnlinkModal}
				handleClose={() => setOpenUnlinkModal(false)}
				loginMethod={loginMethod}
				userId={userId}
			/>
		</Paper>
	);
}
