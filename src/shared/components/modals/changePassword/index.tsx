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

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import { Button, Flex } from "@radix-ui/themes";
import TextField from "@shared/components/text";
import ItemLabel from "@shared/components/itemLabel";

import "./index.scss";
export default function ChangePasswordModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
	return (
		<Modal
			title="Change Password"
			open={open}
			handleClose={handleClose}>
			<Form className="change-password-modal">
				<Form.Paper>
					<Form.Item mb="2">
						<ItemLabel required>New Password:</ItemLabel>
						<TextField type="password" />
					</Form.Item>
					<Form.Item>
						<ItemLabel required>Confirm New Password:</ItemLabel>
						<TextField type="password" />
					</Form.Item>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button size="3">Update Password</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
