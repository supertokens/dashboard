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
import { Flex, Text } from "@radix-ui/themes";
import Button from "@components/radix/button";

import "./index.scss";

export default function DeleteRoleModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
	return (
		<Modal
			title="Delete Role"
			open={open}
			handleClose={handleClose}>
			<Form className="delete-role-modal">
				<Form.Paper>
					<Text
						size="2"
						className="delete-role-modal__disclaimer">
						Are you certain you want to delete role <span>"user"</span> for this user? This action is
						irreversible.
					</Text>
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
