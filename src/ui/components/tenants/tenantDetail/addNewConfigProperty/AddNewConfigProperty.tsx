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

import { ChangeEvent, useContext, useState } from "react";

import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import InputField from "../../../inputField/InputField";
// TODO: Remove this
import { useTenantService } from "../../../../../api/tenants";
import { CORE_CONFIG_PROPERTIES } from "../../../../../constants";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import { NativeSelect } from "../../../nativeSelect/NativeSelect";
import { Toggle } from "../../../toggle/Toggle";
import { useTenantDetailContext } from "../TenantDetailContext";
import "./addNewConfigProperty.scss";

export const AddNewConfigPropertyDialog = ({ onCloseDialog }: { onCloseDialog: () => void }) => {
	const [error, setError] = useState<string | undefined>(undefined);
	const [value, setValue] = useState<string | boolean | undefined>(undefined);
	const [isAddingProperty, setIsAddingProperty] = useState(false);
	const [propertyKey, setPropertyKey] = useState<string | undefined>(undefined);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const alreadyAddedPropertyKeys = Object.keys(tenantInfo.coreConfig);
	const availableProperties = CORE_CONFIG_PROPERTIES.filter(
		(property) => !alreadyAddedPropertyKeys.includes(property.name)
	);
	const { updateTenant } = useTenantService();
	const property = CORE_CONFIG_PROPERTIES.find((property) => property.name === propertyKey);
	const { showToast } = useContext(PopupContentContext);

	const handlePropertyChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setPropertyKey(e.target.value);
		setError(undefined);
		const currentPropertyType = CORE_CONFIG_PROPERTIES.find((property) => property.name === e.target.value)?.type;
		if (currentPropertyType === "boolean") {
			setValue(false);
		} else {
			setValue("");
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (property === undefined) {
			return;
		}
		if (value === undefined) {
			setError("Value is required");
			return;
		}
		if (value === "") {
			setError("Value cannot be empty");
			return;
		}
		if (property.type === "number" && isNaN(Number(value))) {
			setError("Value should be a number");
			return;
		}
		try {
			setIsAddingProperty(true);
			const res = await updateTenant(tenantInfo.tenantId, {
				coreConfig: {
					...tenantInfo.coreConfig,
					[property.name]: value,
				},
			});
			if (res.status === "OK") {
				onCloseDialog();
				void refetchTenant();
			} else {
				throw new Error("Something went wrong!");
			}
		} catch (e) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong!, Failed to fetch tenants login methods!</>,
			});
		} finally {
			setIsAddingProperty(false);
		}
	};

	return (
		<Dialog
			title="Add new Property"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<div className="add-new-config-property-dialog-container">
						<NativeSelect
							label="Property Name"
							value={propertyKey ?? ""}
							onChange={handlePropertyChange}
							options={availableProperties.map((property) => property.name)}
						/>
						{property && (
							<>
								{(property.type === "string" || property.type === "number") && (
									<InputField
										error={error}
										forceShowError={true}
										label="Value"
										name="value"
										type="text"
										value={`${value}`}
										hideColon
										handleChange={(e) => {
											setError(undefined);
											setValue(e.target.value);
										}}
									/>
								)}
								{property.type === "boolean" && (
									<Toggle
										name="value"
										id="value"
										label="Value"
										checked={value as boolean}
										onChange={(e) => {
											setValue(e.target.checked);
										}}
									/>
								)}
							</>
						)}
						{typeof property?.description === "string" && property.description.length > 0 && (
							<div className="block-info block-medium text-small">
								<div className="note-pill">Note</div>
								<p>{property?.description}</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							onClick={onCloseDialog}
							color="gray-outline"
							type="button">
							Go Back
						</Button>
						<Button
							type="submit"
							isLoading={isAddingProperty}
							disabled={isAddingProperty}>
							Done
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
