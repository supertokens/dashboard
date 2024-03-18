/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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
import { Dialog, DialogConfirmText, DialogContent, DialogFooter } from "../../../dialog";

export const NoLoginMethodsAddedDialog = ({ onCloseDialog }: { onCloseDialog: () => void }) => {
	return (
		<Dialog
			title="No login method enabled!"
			isError
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<DialogConfirmText>
					At least one login method needs to be enabled for the user to log in to the tenant.
				</DialogConfirmText>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button onClick={onCloseDialog}>Continue</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
