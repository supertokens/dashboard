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

import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";

export default function AssignRoleConfirmation({
	onCloseDialog,
	assignRoleToUser,
	isAddingRoles,
	role,
}: {
	onCloseDialog: () => void;
	role: string;
	isAddingRoles: boolean;
	assignRoleToUser: (role: string) => void;
}) {
	return (
		<Dialog
			title="Confirmation"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="you-sure-text">
					Please confirm to add <span style={{ color: "var(--color-primary)" }}>{role}</span> role to this
					user.
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						isLoading={isAddingRoles}
						disabled={isAddingRoles}
						onClick={() => assignRoleToUser(role)}>
						Yes, Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
