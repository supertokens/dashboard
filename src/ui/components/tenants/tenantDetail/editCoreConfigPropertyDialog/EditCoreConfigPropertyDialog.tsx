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
import { useUpdateCoreConfigService } from "../../../../../api/tenants";
import { getImageUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Checkbox } from "../../../checkbox/Checkbox";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import InputField from "../../../inputField/InputField";
import { NativeSelect } from "../../../nativeSelect/NativeSelect";
import { Toggle } from "../../../toggle/Toggle";
import { useTenantDetailContext } from "../TenantDetailContext";
import "./editCoreConfigPropertyDialog.scss";

export const EditCoreConfigPropertyDialog = ({
	onCloseDialog,
	possibleValues,
	value,
	type,
	name,
	isNullable,
	description,
	defaultValue,
}: {
	onCloseDialog: () => void;
	possibleValues?: string[];
	value: string | number | boolean | null;
	type: "string" | "number" | "boolean";
	name: string;
	isNullable: boolean;
	description: string;
	defaultValue: string | number | boolean | null;
}) => {
	const [currentValue, setCurrentValue] = useState(value);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const updateCoreConfig = useUpdateCoreConfigService();
	const [isLoading, setIsLoading] = useState(false);
	const isMultiValue = Array.isArray(possibleValues) && possibleValues.length > 0;
	const { showToast } = useContext(PopupContentContext);

	const toggleNull = () => {
		if (currentValue === null) {
			setCurrentValue(type === "number" ? 0 : "");
		} else {
			setCurrentValue(null);
		}
	};

	const handleSaveProperty = async () => {
		try {
			setIsLoading(true);
			const res = await updateCoreConfig(tenantInfo.tenantId, name, currentValue);
			if (res.status !== "OK") {
				if (res.status === "UNKNOWN_TENANT_ERROR") {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>Tenant not found.</>,
					});
				} else {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>{res.message}</>,
					});
				}
				return;
			}
			await refetchTenant();
			onCloseDialog();
		} catch (e) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong please try again.</>,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			title="Edit Property?"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<div>
					<div className="edit-config-property-name-container">
						<div className="edit-config-property-label">Property Name:</div>
						<div className="edit-config-property-name">{name}</div>
					</div>
					<div
						className={`edit-config-property-value-container ${
							type === "boolean" ? "edit-config-property-value-container--row" : ""
						}`}>
						<div className="edit-config-property-label">Value:</div>
						<div className="edit-config-field-container">
							{isMultiValue && (
								<NativeSelect
									id={name}
									options={possibleValues}
									value={currentValue as string}
									onChange={(e) => {
										setCurrentValue(e.target.value);
									}}
								/>
							)}

							{(type === "string" || type === "number") && !isMultiValue && (
								<InputField
									type="text"
									size="small"
									name={name}
									autofocus
									disabled={currentValue === null}
									handleChange={(e) => {
										setCurrentValue(e.target.value);
									}}
									value={currentValue === null ? "[null]" : `${currentValue}`}
								/>
							)}

							{typeof currentValue === "boolean" && type === "boolean" && (
								<Toggle
									name={name}
									id={name}
									checked={currentValue}
									onChange={() => {
										setCurrentValue(!currentValue);
									}}
								/>
							)}
							{isNullable && (
								<Checkbox
									id={`${name}-null-checkbox`}
									label="Set value as null"
									checked={currentValue === null}
									onChange={toggleNull}
								/>
							)}
						</div>
					</div>
					<div className="block-info block-medium text-small edit-config-property-description">
						<div className="edit-config-property-description__info-pill">Info</div>
						<p>{description}</p>
						<div className="edit-config-property-description__default-value">
							Default Value: <b>{`${defaultValue}`}</b>
						</div>
					</div>
				</div>
				<DialogFooter border="border-top">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						isLoading={isLoading}
						disabled={isLoading}
						onClick={handleSaveProperty}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
