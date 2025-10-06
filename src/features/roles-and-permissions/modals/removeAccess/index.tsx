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

import { Flex, Text } from "@radix-ui/themes";

import Form from "@shared/components/form";
import { Modal } from "@shared/components/modal";
import Button from "@shared/components/button";

import "./index.module.scss";

interface RemoveAccessModalProps {
	open: boolean;
	handleClose: () => void;
	onConfirmRemove: () => Promise<void>;
	isRemoving: boolean;
}

export default function RemoveAccessModal({ open, handleClose, onConfirmRemove, isRemoving }: RemoveAccessModalProps) {
	return (
		<Modal
			title="Remove Access"
			open={open}
			handleClose={handleClose}>
			<Form.Paper
				className="remove-access-modal__paper"
				gap="3">
				<Text className="remove-access-modal__text">
					Are you sure you want to remove access for this user? This action is irreversible.
				</Text>
			</Form.Paper>
			<Flex
				justify="end"
				mt="4"
				gap="3">
				<Button
					size="3"
					variant="outline"
					color="gray"
					onClick={handleClose}
					disabled={isRemoving}>
					Cancel
				</Button>
				<Button
					color="red"
					size="3"
					onClick={onConfirmRemove}
					disabled={isRemoving}>
					{isRemoving ? "Removing..." : "Remove"}
				</Button>
			</Flex>
		</Modal>
	);
}
