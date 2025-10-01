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

import { Modal } from "../../modal";
import { Box, Flex, Text, TextField } from "@radix-ui/themes";
import { useState } from "react";

export default function CreateNewRole({ handleClose }: { handleClose: () => void }) {
	const [roleName, setRoleName] = useState("");
	const [permissions, setPermissions] = useState<string[]>([]);
	const [newPermission, setNewPermission] = useState("");
	return (
		<Modal
			open={true}
			handleClose={handleClose}
			size="sm"
			title="Add New Role">
			<Box>
				<Flex>
					<Text>Role Name</Text>
					<TextField.Root
						value={roleName}
						onChange={(e) => setRoleName(e.target.value)}
					/>
				</Flex>
				<Flex>
					<Text>Add Permissions</Text>
					<TextField.Root
						value={newPermission}
						onChange={(e) => setNewPermission(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && newPermission.trim()) {
								setPermissions([...permissions, newPermission.trim()]);
								setNewPermission("");
							}
						}}
					/>
				</Flex>
			</Box>
		</Modal>
	);
}
