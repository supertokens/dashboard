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
import { useThirdPartyService } from "../../../../../api/tenants";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import { useTenantDetailContext } from "../TenantDetailContext";
import { ProviderInfoProps } from "../thirdPartyPage/types";
import "./deleteThirdPartyProvider.scss";

export const DeleteThirdPartyProviderDialog = ({
	onCloseDialog,
	thirdPartyId,
	goBack,
	handlePostSaveProviders,
}: {
	onCloseDialog: () => void;
	goBack: () => void;
	thirdPartyId: string;
	handlePostSaveProviders: ProviderInfoProps["handlePostSaveProviders"];
}) => {
	const [isDeletingProvider, setIsDeletingProvider] = useState(false);
	const { deleteThirdPartyProvider } = useThirdPartyService();
	const { tenantInfo, resolvedProviders } = useTenantDetailContext();
	const { showToast } = useContext(PopupContentContext);
	const isLastProvider = resolvedProviders.length === 1;

	const handleDeleteProperty = async () => {
		try {
			setIsDeletingProvider(true);
			const res = await deleteThirdPartyProvider(tenantInfo.tenantId, thirdPartyId);
			if (res.status === "OK") {
				await handlePostSaveProviders("delete", thirdPartyId);
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
			setIsDeletingProvider(false);
		}
	};

	return (
		<Dialog
			title={isLastProvider ? "Provider cannot be deleted" : "Delete Provider?"}
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="confirm-text">
					{isLastProvider ? (
						<>
							This is your only added provider, and it cannot be deleted because at least one provider is
							required when third party login method is enabled.
						</>
					) : (
						<>
							Are you sure you want to delete the provider:{" "}
							<span className="third-party-id">{thirdPartyId}</span>
						</>
					)}
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					{!isLastProvider && (
						<Button
							color="danger"
							isLoading={isDeletingProvider}
							disabled={isDeletingProvider}
							onClick={handleDeleteProperty}>
							Yes, Delete
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
