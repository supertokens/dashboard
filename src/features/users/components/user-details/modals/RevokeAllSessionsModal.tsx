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
import { Flex, Text } from "@radix-ui/themes";

import Button from "@shared/components/button";
import { Modal } from "@shared/components/modal";
import { useToast } from "@shared/components/toast";

import { useSessions } from "@features/users/hooks/useSessions";

import styles from "./RevokeAllSessionsModal.module.scss";
import Form from "@shared/components/form";

interface RevokeAllSessionsModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
}

export default function RevokeAllSessionsModal({ open, handleClose, userId }: RevokeAllSessionsModalProps) {
	const { sessions, deleteSessions, isDeletingSessions } = useSessions(userId);
	const { showSuccessToast, showErrorToast } = useToast();

	const [isRevoking, setIsRevoking] = useState(false);

	const handleRevokeAll = async () => {
		if (!sessions || sessions.length === 0) return;

		try {
			setIsRevoking(true);
			const sessionHandles = sessions.map((session) => session.sessionHandle);
			await deleteSessions(sessionHandles);
			showSuccessToast(`Successfully revoked ${sessions.length} session${sessions.length === 1 ? "" : "s"}`);
			handleClose();
		} catch (error) {
			showErrorToast("Failed to revoke sessions");
		} finally {
			setIsRevoking(false);
		}
	};

	return (
		<Modal
			title="Revoke All Sessions"
			open={open}
			handleClose={handleClose}>
			<Form.Paper
				className={styles["revoke-all-sessions-modal__paper"]}
				gap="3">
				<Text className={styles["revoke-all-sessions-modal__description"]}>
					Are you sure you want to revoke all sessions for this user?. This action is irreversible.
				</Text>
			</Form.Paper>
			<Flex
				justify="end"
				mt="4">
				<Button
					size="3"
					color="red"
					onClick={handleRevokeAll}
					loading={isRevoking || isDeletingSessions}>
					Revoke
				</Button>
			</Flex>
		</Modal>
	);
}
