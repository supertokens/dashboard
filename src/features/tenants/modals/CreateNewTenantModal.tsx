/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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
import { Flex, Text, TextField } from "@radix-ui/themes";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import Button from "@shared/components/button";

import styles from "./CreateNewTenantModal.module.scss";
import ItemLabel from "@shared/components/itemLabel";

interface CreateNewTenantModalProps {
	open: boolean;
	handleClose: () => void;
	onCreateTenant: (tenantId: string) => Promise<void>;
	isCreating: boolean;
}

export default function CreateNewTenantModal({
	open,
	handleClose,
	onCreateTenant,
	isCreating,
}: CreateNewTenantModalProps) {
	const [tenantId, setTenantId] = useState("");
	const [error, setError] = useState<string | undefined>(undefined);

	const handleSubmit = async () => {
		if (tenantId.trim().length === 0) {
			setError("Please enter a valid Tenant Id!");
			return;
		}

		try {
			await onCreateTenant(tenantId.trim());
			setTenantId("");
			setError(undefined);
			handleClose();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Something went wrong. Please try again later.");
			}
		}
	};

	const handleInputChange = (value: string) => {
		setTenantId(value);
		setError(undefined);
	};

	const handleModalClose = () => {
		setTenantId("");
		setError(undefined);
		handleClose();
	};

	return (
		<Modal
			title="Create New Tenant"
			open={open}
			handleClose={handleModalClose}>
			<Form className={styles["create-new-tenant-modal"]}>
				<Form.Paper>
					<Form.Item>
						<ItemLabel
							mb="2"
							htmlFor="tenant-id">
							Tenant Id
						</ItemLabel>
						<TextField.Root
							id="tenant-id"
							value={tenantId}
							onChange={(e) => handleInputChange(e.target.value)}
							autoFocus
							disabled={isCreating}
						/>
						{error && (
							<Text
								size="2"
								className={styles["create-new-tenant-modal__error"]}>
								{error}
							</Text>
						)}
					</Form.Item>
				</Form.Paper>
				<Flex
					justify="end"
					mt="5">
					<Button
						size="3"
						onClick={handleSubmit}
						disabled={isCreating}>
						{isCreating ? "Creating..." : "Create Tenant"}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
