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

import Form from "@components/radix/form";
import { Modal } from "@components/radix/modal";
import { Text } from "@radix-ui/themes";

import "./index.scss";

export default function RemoveAccessModal({ open, handleClose }: { open: boolean; handleClose: () => void }) {
	return (
		<Modal
			title="Remove Access"
			open={open}
			handleClose={handleClose}>
			<Form.Paper
				className="remove-access-modal__paper"
				gap="3">
				<Text className="remove-access-modal__text">
					Are you sure you want to access of the user <span>"John Williams"</span> to the role? This action is
					irreversible.
				</Text>
			</Form.Paper>
		</Modal>
	);
}
