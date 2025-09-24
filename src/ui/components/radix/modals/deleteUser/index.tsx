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

import { Modal } from "@components/radix/modal";
import Form from "@components/radix/form";
import { Button, Flex, Text } from "@radix-ui/themes";
import TextField from "@components/radix/text";
import "./index.scss";

export default function DeleteUserModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
	return (
		<Modal
			title="Delete User"
			open={open}
			handleClose={handleClose}>
			<Form className="delete-user-modal">
				<Form.Paper>
					<Text
						size="2"
						className="delete-user-modal__disclaimer">
						To delete the user, please confirm by typing the user's email:
						<span>"robert.hernandez@example.com"</span> below. This will also delete any accounts linked to
						this user.
					</Text>
					<Form.Item mt="4">
						<TextField placeholder="robert.hernandez@example.com" />
					</Form.Item>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button
						color="red"
						size="3">
						Delete
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
