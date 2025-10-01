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
import ItemLabel from "@shared/components/itemLabel";
import { Flex, TextField } from "@radix-ui/themes";
import Button from "@shared/components/button";
import { AssignPermission } from "@shared/components/assignPermission";

export default function CreateNewRoleModal({ handleClose, open }: { handleClose: () => void; open: boolean }) {
	return (
		<Modal
			open={open}
			handleClose={handleClose}
			title="Add New Role"
			size="lg">
			<Form className="create-new-role-modal">
				<Form.Paper>
					<Form.Item>
						<ItemLabel mb="2">Role Name</ItemLabel>
						<TextField.Root />
					</Form.Item>
				</Form.Paper>
				<AssignPermission />
				<Flex
					justify="end"
					mt="4">
					<Button size="3">Save</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
