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
import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";
import Crystal from "@shared/components/crystal";
import Button from "@shared/components/button";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import EmptyList from "@shared/components/empty";
import CopyBox from "@shared/components/copyBox";

import { formatNumber } from "@utils";
import { useSessions } from "@features/users/hooks/useSessions";
import { RevokeSessionModal, RevokeAllSessionsModal } from "../modals";

import styles from "./Sessions.module.scss";

interface SessionHeaderProps {
	readonly userId: string;
}

const SessionHeader = ({ userId }: SessionHeaderProps) => {
	const { sessions } = useSessions(userId);
	const [openRevokeAllSessionModal, setOpenRevokeAllSessionModal] = useState(false);

	return (
		<Box width="100%">
			<Flex
				className={styles["sessions__header"]}
				justify="between"
				align="center"
				px="4"
				py="3">
				<Flex align="center">
					<ItemLabel mr="2">Sessions:</ItemLabel>
					<Crystal>{sessions.length}</Crystal>
				</Flex>
				<Button
					size="2"
					color="red"
					onClick={() => setOpenRevokeAllSessionModal(true)}
					disabled={sessions.length === 0}>
					Revoke All Sessions
				</Button>
			</Flex>
			<RevokeAllSessionsModal
				open={openRevokeAllSessionModal}
				handleClose={() => setOpenRevokeAllSessionModal(false)}
				userId={userId}
			/>
			<Separator fullWidth />
		</Box>
	);
};

interface SessionListProps {
	readonly userId: string;
}

const SessionList = ({ userId }: SessionListProps) => {
	const { sessions } = useSessions(userId);
	const [openRevokeSessionModal, setOpenRevokeSessionModal] = useState(false);
	const [selectedSessionHandle, setSelectedSessionHandle] = useState<string>("");

	const handleRevokeClick = (sessionHandle: string) => {
		setSelectedSessionHandle(sessionHandle);
		setOpenRevokeSessionModal(true);
	};

	if (sessions.length === 0) {
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
			{sessions.map((session) => {
				const createdDate = new Date(session.timeCreated);
				const timeUntilExpiry = Math.max(0, session.expiry - Date.now());
				const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
				const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
				const secondsUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60)) / 1000);

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

						<ItemLabel className={styles["session-list__item__created-at"]}>
							{createdDate.toLocaleDateString()}
						</ItemLabel>
						<ItemLabel className={styles["session-list__item__expires-at"]}>
							{timeUntilExpiry > 0
								? `${hoursUntilExpiry}h ${minutesUntilExpiry}m ${secondsUntilExpiry}s`
								: "Expired"}
						</ItemLabel>
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
};

interface SessionListFooterProps {
	readonly userId: string;
}

const SessionListFooter = ({ userId }: SessionListFooterProps) => {
	const { sessions } = useSessions(userId);
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;
	const totalPages = Math.ceil(sessions.length / pageSize);
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, sessions.length);

	const handlePreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	if (sessions.length === 0) {
		return null;
	}

	return (
		<Flex
			align="center"
			justify="end"
			gap="3"
			my="4"
			px="4">
			<Text
				size="2"
				weight="medium">
				{startIndex} - {endIndex} of {formatNumber(sessions.length)}
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					onClick={handlePreviousPage}
					disabled={currentPage === 1}>
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					onClick={handleNextPage}
					disabled={currentPage === totalPages}>
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
};

interface SessionsProps {
	readonly userId: string;
}

export default function Sessions({ userId }: SessionsProps) {
	const { isLoading, error } = useSessions(userId);

	if (isLoading) {
		return (
			<Flex
				width="100%"
				p="3">
				<Loader type="list" />
			</Flex>
		);
	}

	if (error) {
		return <DashboardError withBackground={false} />;
	}

	return (
		<Flex
			width="100%"
			direction="column">
			<SessionHeader userId={userId} />
			<SessionList userId={userId} />
			<SessionListFooter userId={userId} />
		</Flex>
	);
}
