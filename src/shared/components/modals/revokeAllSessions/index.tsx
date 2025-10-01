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

import Button from "@shared/components/button";
import Form from "@shared/components/form";
import { Modal } from "@shared/components/modal";
import { Flex, Text } from "@radix-ui/themes";

import "./index.scss";

export default function RevokeAllSessionsModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
	return (
		<Modal
			title="Revoke All Sessions"
			open={open}
			handleClose={handleClose}>
			<Form.Paper
				className="revoke-all-sessions-modal__paper"
				gap="3">
				<Text className="revoke-all-sessions-modal__text">
					Are you certain want to revoke all the sessions of <span>Robert Harnandez</span>?
				</Text>
				<Text className="revoke-all-sessions-modal__text">
					Note that with no active session, the user will be deleted permanently.
				</Text>
			</Form.Paper>
			<Flex
				justify="end"
				mt="4">
				<Button
					size="3"
					color="red">
					Revoke
				</Button>
			</Flex>
		</Modal>
	);
}
