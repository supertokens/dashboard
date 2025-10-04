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

import { useUserDetails } from "@features/users/hooks/useUserDetails";

import styles from "./RevokeAllSessionsModal.module.scss";

interface RevokeAllSessionsModalProps {
	readonly open: boolean;
	readonly handleClose: () => void;
	readonly userId: string;
}

export default function RevokeAllSessionsModal({ open, handleClose, userId }: RevokeAllSessionsModalProps) {
	const { sessions, deleteSessions, isDeletingSessions } = useUserDetails({ userId });
	const { showSuccessToast, showErrorToast } = useToast();

	const [isRevoking, setIsRevoking] = useState(false);

	const handleRevokeAll = async () => {
		if (sessions.length === 0) return;

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
			open={open}
			handleClose={handleClose}
			title="Revoke All Sessions"
			size="sm">
			<div className={styles["revoke-all-sessions-modal"]}>
				<Text className={styles["revoke-all-sessions-modal__description"]}>
					Are you sure you want to revoke all {sessions.length} active session
					{sessions.length === 1 ? "" : "s"}? The user will be logged out of all devices immediately.
				</Text>

				<Flex
					justify="end"
					gap="3"
					mt="5">
					<Button
						size="3"
						variant="outline"
						color="gray"
						onClick={handleClose}
						disabled={isRevoking || isDeletingSessions}>
						Cancel
					</Button>
					<Button
						size="3"
						color="red"
						onClick={handleRevokeAll}
						loading={isRevoking || isDeletingSessions}>
						Revoke All Sessions
					</Button>
				</Flex>
			</div>
		</Modal>
	);
}
