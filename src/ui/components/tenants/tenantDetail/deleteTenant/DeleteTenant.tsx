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
import { useContext, useState } from "react";
import { useTenantService } from "../../../../../api/tenants";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import "./deleteTenant.scss";

export const DeleteTenantDialog = ({
	onCloseDialog,
	tenantId,
	goBack,
}: {
	onCloseDialog: () => void;
	goBack: () => void;
	tenantId: string;
}) => {
	const [isDeletingTenant, setIsDeletingTenant] = useState(false);
	const { deleteTenant } = useTenantService();
	const { showToast } = useContext(PopupContentContext);

	const handleDeleteProperty = async () => {
		try {
			setIsDeletingTenant(true);
			const res = await deleteTenant(tenantId);
			if (res.status === "OK") {
				onCloseDialog();
				goBack();
			} else {
				throw new Error("Something went wrong!");
			}
		} catch (error) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				children: "Something went wrong. Please try again.",
				toastType: "error",
			});
		} finally {
			setIsDeletingTenant(false);
		}
	};

	return (
		<Dialog
			title="Delete Tenant?"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="confirm-text">
					Are you sure you want to delete the tenant: <span className="tenant-id">{tenantId}</span>? All the
					users associated with the tenant will be moved to the public tenant
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						color="danger"
						isLoading={isDeletingTenant}
						disabled={isDeletingTenant}
						onClick={handleDeleteProperty}>
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
