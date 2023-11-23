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

export default function DeletePermissionDialog({
	selectedPermissions,
	isDeletingRoles,
	onCloseDialog,
	handleDeletePermissions,
}: {
	selectedPermissions: string[];
	onCloseDialog: () => void;
	handleDeletePermissions: () => void;
	isDeletingRoles: boolean;
}) {
	return (
		<Dialog
			title="Delete Permission?"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="you-sure-text">
					Are you sure you want to delete selected permission{selectedPermissions.length > 1 ? "s" : ""}? This
					action is irreversible.
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						color="danger"
						isLoading={isDeletingRoles}
						disabled={isDeletingRoles}
						onClick={handleDeletePermissions}>
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
