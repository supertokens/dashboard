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
import { Box, Flex } from "@radix-ui/themes";

import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";
import Crystal from "@shared/components/crystal";
import Button from "@shared/components/button";

import { useSessions } from "@features/users/hooks/useSessions";
import { RevokeAllSessionsModal } from "../modals";

import styles from "./SessionHeader.module.scss";

interface SessionHeaderProps {
	readonly userId: string;
}

export default function SessionHeader({ userId }: SessionHeaderProps) {
	const { sessions } = useSessions(userId);
	const [openRevokeAllSessionModal, setOpenRevokeAllSessionModal] = useState(false);

	return (
		<Box width="100%">
			<Flex
				className={styles["session-header"]}
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
}
