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

export const AddNewProviderDialog = ({
	onCloseDialog,
	handleContinue,
}: {
	onCloseDialog: () => void;
	handleContinue: () => void;
}) => {
	return (
		<Dialog
			title="Add a Provider"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<DialogConfirmText>
					At least one Social / Enterprise login provider is required to enable the third party provider login
					method to work.
					<br />
					<br />
					Click “continue” to add a new provider in next step.
				</DialogConfirmText>
				<DialogFooter>
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button onClick={handleContinue}>Continue</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
