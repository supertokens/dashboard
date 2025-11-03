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
import { Flex, Text } from "@radix-ui/themes";

import { Modal } from "@shared/components/modal";
import Form from "@shared/components/form";
import Button from "@shared/components/button";
import { useToast } from "@shared/components/toast";
import { useDeleteThirdPartyProviderService } from "@api/tenants";
import { useTenantDetails } from "@features/tenants/hooks/useTenantDetails";

import styles from "./DeleteProviderConfigModal.module.scss";

interface DeleteProviderConfigModalProps {
	open: boolean;
	handleClose: () => void;
	tenantId: string;
	providerId: string;
	onSuccess?: () => void;
}

export default function DeleteProviderConfigModal({
	open,
	handleClose,
	tenantId,
	providerId,
	onSuccess,
}: DeleteProviderConfigModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const deleteThirdPartyProvider = useDeleteThirdPartyProviderService();
	const { refetch } = useTenantDetails(tenantId);
	const { showSuccessToast, showErrorToast } = useToast();

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			const response = await deleteThirdPartyProvider(tenantId, providerId);

			if (response.status === "OK") {
				showSuccessToast("Success", "Provider deleted successfully");
				await refetch();
				handleClose();
				if (onSuccess) {
					onSuccess();
				}
			} else {
				showErrorToast("Error", "Failed to delete provider");
			}
		} catch (error) {
			showErrorToast("Error", "An unexpected error occurred");
		} finally {
			setIsDeleting(false);
		}
	};

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
					gap="2"
					mt="4">
					<Button
						variant="outline"
						color="gray"
						size="3"
						onClick={handleClose}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						color="red"
						size="3"
						onClick={handleDelete}
						disabled={isDeleting}>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}
