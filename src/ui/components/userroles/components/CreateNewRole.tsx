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

import { useState } from "react";

import { ReactComponent as PlusIcon } from "../../../../assets/plus.svg";
import Button from "../../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../../dialog";
import InputField from "../../inputField/InputField";

import TagsInputField from "../../inputField/TagsInputField";
import "./createNewRole.scss";

export default function CreateNewRole() {
	const [isDialogOpen, setIsDialogOpen] = useState(true);
	const [permissions, setPermissions] = useState<string[]>([]);

	function openDialog() {
		setIsDialogOpen(true);
	}

	function closeDialog() {
		setIsDialogOpen(false);
	}

	// function handleCreateRole() {}

	return (
		<>
			<Button
				onClick={openDialog}
				color="secondary">
				<PlusIcon />
				Add Role
			</Button>
			<Dialog
				closeDialog={closeDialog}
				isDialogOpen={isDialogOpen}>
				<DialogContent>
					<DialogHeader>Create New Role</DialogHeader>
					<div className="create-role-dialog-container">
						<div>
							<InputField
								label="Name of Role"
								name="roleName"
								type="text"
								hideColon
								handleChange={(e) => {
									e.currentTarget.value;
								}}
							/>
						</div>
						<div>
							<TagsInputField
								onTagsChange={(tags) => setPermissions(tags)}
								tags={permissions}
								label="Add Permissions"
								name="permisions"
								type="text"
								focusText="Write permission name and press enter."
							/>
						</div>
					</div>
					<DialogFooter>
						<Button color="gray-outline">Go Back</Button>
						<Button>Create now</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
