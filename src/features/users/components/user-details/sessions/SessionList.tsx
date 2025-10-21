/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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
import { Box, Flex } from "@radix-ui/themes";

import ItemLabel from "@shared/components/itemLabel";
import Button from "@shared/components/button";
import EmptyList from "@shared/components/empty";
import CopyBox from "@shared/components/copyBox";

import { formatLongDate, getFormattedLongDateWithoutTime } from "@shared/utils";
import { RevokeSessionModal } from "../modals";
import { SessionInfo } from "@features/users/types";

import styles from "./SessionList.module.scss";

interface SessionListProps {
	readonly userId: string;
	readonly paginatedSessions: SessionInfo[];
}

export default function SessionList({ userId, paginatedSessions }: SessionListProps) {
	const [openRevokeSessionModal, setOpenRevokeSessionModal] = useState(false);
	const [selectedSessionHandle, setSelectedSessionHandle] = useState<string>("");

	const handleRevokeClick = (sessionHandle: string) => {
		setSelectedSessionHandle(sessionHandle);
		setOpenRevokeSessionModal(true);
	};

	if (paginatedSessions.length === 0) {
		return (
			<EmptyList
				iconUrl="user.svg"
				title="No active sessions"
				description="This user currently has no active sessions. When the user logs in, their session details will appear here."
			/>
		);
	}

	return (
		<Flex
			direction="column"
			className={styles["session-list"]}
			m="4">
			<Flex
				className={styles["session-list__header"]}
				p="3">
				<ItemLabel className={styles["session-list__header__session-handle"]}>Session Handle</ItemLabel>
				<ItemLabel className={styles["session-list__header__created-at"]}>Created At</ItemLabel>
				<ItemLabel className={styles["session-list__header__expires-at"]}>Expires At</ItemLabel>
				<ItemLabel className={styles["session-list__header__action"]}>Action</ItemLabel>
			</Flex>
			{paginatedSessions.map((session) => {
				const createdDate = getFormattedLongDateWithoutTime(session.timeCreated);
				const expiresDate = formatLongDate(session.expiry);

				return (
					<Flex
						key={session.sessionHandle}
						className={styles["session-list__item"]}
						align="center"
						p="3">
						<Box className={styles["session-list__item__session-handle"]}>
							<CopyBox
								text={session.sessionHandle}
								name="Session Handle"
								className={styles["session-list__item__session-handle__copy-box"]}
							/>
						</Box>

						<ItemLabel className={styles["session-list__item__created-at"]}>{createdDate}</ItemLabel>
						<ItemLabel className={styles["session-list__item__expires-at"]}>{expiresDate}</ItemLabel>
						<Button
							size="2"
							color="red"
							variant="outline"
							className={styles["session-list__item__action"]}
							onClick={() => handleRevokeClick(session.sessionHandle)}>
							Revoke
						</Button>
					</Flex>
				);
			})}
			<RevokeSessionModal
				open={openRevokeSessionModal}
				handleClose={() => setOpenRevokeSessionModal(false)}
				sessionHandle={selectedSessionHandle}
				userId={userId}
			/>
		</Flex>
	);
}
