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
import { Box, Flex, IconButton, Text } from "@radix-ui/themes";
import ItemLabel from "@shared/components/itemLabel";
import Separator from "@shared/components/separator";

import Crystal from "@shared/components/crystal";
import Button from "@shared/components/button";
import { useState } from "react";
import Loader from "@shared/components/loader";
import DashboardError from "@shared/components/error";
import EmptyList from "@shared/components/empty";

import "./userDetailSessionListTest.scss";
import { assertNever } from "@utils/assertNever";
import CopyBox from "@shared/components/copyBox";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { formatNumber } from "@utils";
import { NOOP } from "@utils/noop";
import RevokeSessionModal from "@shared/components/modals/revokeSession";
import RevokeAllSessionsModal from "@shared/components/modals/revokeAllSessions";

const SessionHeader = () => {
	const [openRevokeAllSessionModal, setOpenRevokeAllSessionModal] = useState(false);
	return (
		<Box width="100%">
			<Flex
				className="sessions__header"
				justify="between"
				align="center"
				px="4"
				py="3">
				<Flex align="center">
					<ItemLabel mr="2">Sessions:</ItemLabel>
					<Crystal>12</Crystal>
				</Flex>
				<Button
					size="2"
					color="red"
					onClick={() => setOpenRevokeAllSessionModal(true)}>
					Revoke All Sessions
				</Button>
			</Flex>
			<RevokeAllSessionsModal
				open={openRevokeAllSessionModal}
				handleClose={() => setOpenRevokeAllSessionModal(false)}
			/>

			<Separator fullWidth />
		</Box>
	);
};

const SessionList = () => {
	const [openRevokeSessionModal, setOpenRevokeSessionModal] = useState(false);
	const list = [1];
	if (list.length === 0) {
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
			className="session-list"
			m="4">
			<Flex
				className="session-list__header"
				p="3">
				<ItemLabel className="session-list__header__session-handle">Session Handle</ItemLabel>
				<ItemLabel className="session-list__header__created-at">Created At</ItemLabel>
				<ItemLabel className="session-list__header__expires-at">Expires At</ItemLabel>
				<ItemLabel className="session-list__header__action">Action</ItemLabel>
			</Flex>
			{[1, 2, 3].map((_, index) => (
				<Flex
					key={index}
					className="session-list__item"
					align="center"
					p="3">
					<Box className="session-list__item__session-handle">
						<CopyBox
							text="dfg76sd76f87u6sd87dffzdx...87zxv566zx66c"
							name="Session Handle"
							className="session-list__item__session-handle__copy-box"
						/>
					</Box>

					<ItemLabel className="session-list__item__created-at">4th May 2025</ItemLabel>
					<ItemLabel className="session-list__item__expires-at">10h 22m 8s</ItemLabel>
					<Button
						size="2"
						color="red"
						variant="outline"
						className="session-list__item__action"
						onClick={() => setOpenRevokeSessionModal(true)}>
						Revoke
					</Button>
				</Flex>
			))}
			<RevokeSessionModal
				open={openRevokeSessionModal}
				handleClose={() => setOpenRevokeSessionModal(false)}
			/>
		</Flex>
	);
};

const SessionListFooter = () => {
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
				{1} - {10} of {formatNumber(100)}
			</Text>
			<Flex gap="3">
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					onClick={NOOP}>
					<ChevronLeftIcon />
				</IconButton>
				<IconButton
					size="2"
					variant="soft"
					color="gray"
					onClick={NOOP}>
					<ChevronRightIcon />
				</IconButton>
			</Flex>
		</Flex>
	);
};

export default function Sessions() {
	const [state] = useState<"LOADING" | "SUCCESS" | "ERROR">("SUCCESS");

	switch (state) {
		case "LOADING":
			return (
				<Flex
					width="100%"
					p="3">
					<Loader type="list" />
				</Flex>
			);
		case "SUCCESS":
			return (
				<Flex
					width="100%"
					direction="column">
					<SessionHeader />
					<SessionList />
					<SessionListFooter />
				</Flex>
			);
		case "ERROR":
			return <DashboardError withBackground={false} />;
		default:
			assertNever(state);
	}
}
