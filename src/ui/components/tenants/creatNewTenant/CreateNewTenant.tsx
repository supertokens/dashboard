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

import { useState } from "react";

import Button from "../../button";
import { Dialog, DialogContent, DialogFooter } from "../../dialog";
import InputField from "../../inputField/InputField";

import { useNavigate } from "react-router-dom";
import { useCreateTenantService } from "../../../../api/tenants";
import "./createNewTenant.scss";

export const CreateNewTenantDialog = ({ onCloseDialog }: { onCloseDialog: () => void }) => {
	const createTenant = useCreateTenantService();
	const navigate = useNavigate();
	const [tenantCreationError, setTenantCreationError] = useState<string | undefined>(undefined);
	const [isCreatingTenant, setIsCreatingTenant] = useState(false);
	const [tenantId, setTenantId] = useState("");

	const handleCreateTenant = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (tenantId.trim().length === 0) {
			setTenantCreationError("Please enter a valid Tenant Id!");
			return;
		}
		try {
			setIsCreatingTenant(true);
			const resp = await createTenant(tenantId);
			if (resp.status === "OK") {
				navigate(`?tenantId=${tenantId.toLowerCase()}`);
				onCloseDialog();
			} else if (resp.status === "MULTITENANCY_NOT_ENABLED_IN_CORE_ERROR") {
				setTenantCreationError(
					"Multitenancy is not enabled for your SuperTokens instance. Please add a license key to enable it."
				);
			} else if (resp.status === "TENANT_ID_ALREADY_EXISTS_ERROR") {
				setTenantCreationError("Provided tenant id already exists.");
			} else if (resp.status === "INVALID_TENANT_ID_ERROR") {
				setTenantCreationError(resp.message);
			} else {
				throw new Error("Failed to create tenant");
			}
		} catch (e) {
			setTenantCreationError("Something went wrong. Please try again later.");
		} finally {
			setIsCreatingTenant(false);
		}
	};

	return (
		<Dialog
			title="Create New Tenant"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<form onSubmit={handleCreateTenant}>
					<div className="create-tenant-dialog-container">
						<InputField
							error={tenantCreationError}
							forceShowError={true}
							label="Tenant Id"
							autofocus
							name="tenantId"
							type="text"
							value={tenantId}
							hideColon
							handleChange={(e) => {
								if (e.type === "change") {
									setTenantCreationError(undefined);
									setTenantId(e.currentTarget.value.trim());
								}
							}}
						/>
					</div>
					<DialogFooter>
						<Button
							onClick={onCloseDialog}
							color="gray-outline"
							type="button">
							Go Back
						</Button>
						<Button
							isLoading={isCreatingTenant}
							disabled={isCreatingTenant}
							type="submit">
							Create now
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
