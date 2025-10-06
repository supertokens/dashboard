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

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import Button from "@shared/components/button";

import styles from "./DeleteProviderConfigModal.module.scss";

interface DeleteProviderConfigModalProps {
	open: boolean;
	handleClose: () => void;
}

export default function DeleteProviderConfigModal({ open, handleClose }: DeleteProviderConfigModalProps) {
	return (
		<Modal
			title="Delete Provider"
			size="md"
			open={open}
			handleClose={handleClose}>
			<Form className={styles["delete-provider-config-modal"]}>
				<Form.Paper>
					<Text
						size="2"
						className={styles["delete-provider-config-modal__disclaimer"]}>
						Are you certain you want to delete this provider? This action is irreversible.
					</Text>
				</Form.Paper>
				<Flex
					justify="end"
					mt="4">
					<Button
						color="red"
						size="3">
						Delete
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
