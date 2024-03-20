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
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import "./deleteThirdPartyClient.scss";

export const DeleteClientDialog = ({
	onCloseDialog,
	clientType,
	handleDeleteClient,
}: {
	onCloseDialog: () => void;
	clientType?: string;
	handleDeleteClient: () => void;
}) => {
	return (
		<Dialog
			title="Delete Client?"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="confirm-text">
					Are you sure you want to delete the{" "}
					{typeof clientType === "string" && clientType.length > 0 ? (
						<>
							client: <span className="client-type">{clientType}</span>
						</>
					) : (
						"client"
					)}
					?
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						color="danger"
						onClick={handleDeleteClient}>
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
