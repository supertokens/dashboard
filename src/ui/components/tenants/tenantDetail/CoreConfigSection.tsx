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
import { useContext, useEffect, useState } from "react";
import { useUpdateCoreConfigService } from "../../../../api/tenants";
import { ReactComponent as PencilIcon } from "../../../../assets/edit.svg";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { ReactComponent as QuestionMarkIcon } from "../../../../assets/question-mark.svg";
import { PUBLIC_TENANT_ID } from "../../../../constants";
import { getConnectionUri, getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import Button from "../../button";
import { Checkbox } from "../../checkbox/Checkbox";
import InputField from "../../inputField/InputField";
import { NativeSelect } from "../../nativeSelect/NativeSelect";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { EditPluginPropertyDialog } from "./editPluginPropertyDialog/EditPluginPropertyDialog";
import { useTenantDetailContext } from "./TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";
import { UneditablePropertyDialog } from "./uneditablePropertyDialog/UneditablePropertyDialog";

export const CoreConfigSection = () => {
	const { tenantInfo } = useTenantDetailContext();
	const [showPluginDialog, setShowPluginDialog] = useState(false);

	const hasPluginProperties = tenantInfo.coreConfig.some((config) => config.isPluginProperty);

	let databaseType: "postgres" | "mysql" | null = null;

	if (hasPluginProperties) {
		if (tenantInfo.coreConfig.some((property) => property.key.startsWith("postgresql_"))) {
			databaseType = "postgres";
		} else if (tenantInfo.coreConfig.some((property) => property.key.startsWith("mysql_"))) {
			databaseType = "mysql";
		}
	}

	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="Customize the supertokens core settings that you want to use for your tenant.">
					Core Config
				</PanelHeaderTitleWithTooltip>
			</PanelHeader>

			<div className="tenant-detail__core-config-table">
				{tenantInfo.coreConfig
					.filter((config) => !config.isPluginProperty)
					.map((config) => {
						return (
							<CoreConfigTableRow
								name={config.key}
								value={config.value}
								type={config.valueType}
								isNullable={config.isNullable}
								key={config.key}
								tooltip={config.description}
								defaultValue={config.defaultValue}
								isSaaSProtected={config.isSaaSProtected}
								isDifferentAcrossTenants={config.isDifferentAcrossTenants}
								isModifyableOnlyViaConfigYaml={config.isModifyableOnlyViaConfigYaml}
								isPluginProperty={config.isPluginProperty}
								isPluginPropertyEditable={config.isPluginPropertyEditable}
								possibleValues={config.possibleValues}
							/>
						);
					})}
				{hasPluginProperties && (
					<>
						<div className="tenant-detail__core-config-table__plugin-properties-container">
							<h2 className="tenant-detail__core-config-table__plugin-propertier-header">
								Database Properties
							</h2>
							<hr className="tenant-detail__core-config-table__plugin-properties-divider" />
							<p className="tenant-detail__core-config-table__plugin-properties-description">
								Some of these properties need to be modified together, hence they cannot be directly
								modified from the UI, instead you can make an API request to core to modify these
								properties.{" "}
								<button
									onClick={() => setShowPluginDialog(true)}
									className="tenant-detail__core-config-table__button-link">
									Click here
								</button>{" "}
								to see an example.
							</p>
						</div>
						{tenantInfo.coreConfig
							.filter((config) => config.isPluginProperty)
							.map((config) => {
								return (
									<CoreConfigTableRow
										name={config.key}
										value={config.value}
										type={config.valueType}
										isNullable={config.isNullable}
										key={config.key}
										tooltip={config.description}
										defaultValue={config.defaultValue}
										isSaaSProtected={config.isSaaSProtected}
										isDifferentAcrossTenants={config.isDifferentAcrossTenants}
										isModifyableOnlyViaConfigYaml={config.isModifyableOnlyViaConfigYaml}
										isPluginProperty={config.isPluginProperty}
										isPluginPropertyEditable={config.isPluginPropertyEditable}
										possibleValues={config.possibleValues}
									/>
								);
							})}

						{showPluginDialog && databaseType !== null && (
							<EditPluginPropertyDialog
								onCloseDialog={() => setShowPluginDialog(false)}
								tenantId={tenantInfo.tenantId}
								databaseType={databaseType}
							/>
						)}
					</>
				)}
			</div>
		</PanelRoot>
	);
};

type CoreConfigTableRowProps = {
	name: string;
	value: string | number | boolean | null;
	type: "string" | "boolean" | "number";
	isNullable: boolean;
	tooltip: string;
	defaultValue: string | number | boolean | null;
	possibleValues?: string[];
	isSaaSProtected: boolean;
	isDifferentAcrossTenants: boolean;
	isModifyableOnlyViaConfigYaml: boolean;
	isPluginProperty: boolean;
	isPluginPropertyEditable: boolean;
};

const isUsingSaaS = localStorage.getItem("isUsingSaaS") === "true";
const isUsingNonPublicApp = /appid-.*$/.test(getConnectionUri());

const CoreConfigTableRow = ({
	name,
	value,
	tooltip,
	type,
	isNullable,
	possibleValues,
	isSaaSProtected,
	isDifferentAcrossTenants,
	isModifyableOnlyViaConfigYaml,
	isPluginProperty,
	isPluginPropertyEditable,
}: CoreConfigTableRowProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [currentValue, setCurrentValue] = useState(value);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const updateCoreConfig = useUpdateCoreConfigService();
	const [isLoading, setIsLoading] = useState(false);
	const [isUneditablePropertyDialogVisible, setIsUneditablePropertyDialogVisible] = useState(false);
	const isMultiValue = Array.isArray(possibleValues) && possibleValues.length > 0;
	const isPublicTenant = tenantInfo.tenantId === PUBLIC_TENANT_ID;
	const { showToast } = useContext(PopupContentContext);

	const isUneditable =
		isPublicTenant ||
		(isPluginProperty && !isPluginPropertyEditable) ||
		isModifyableOnlyViaConfigYaml ||
		(isUsingSaaS && isSaaSProtected) ||
		(!isPublicTenant && !isDifferentAcrossTenants);

	// Keep the state in sync with the prop value
	useEffect(() => {
		setCurrentValue(value);
	}, [value]);

	const toggleNull = () => {
		if (currentValue === null) {
			setCurrentValue(type === "number" ? 0 : "");
		} else {
			setCurrentValue(null);
		}
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setCurrentValue(value);
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
			setIsEditing(false);
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

	const renderConfigAction = () => {
		if (isUneditable) {
			return null;
		}

		if (!isEditing) {
			return (
				<button
					className="tenant-detail__core-config-table__row-edit-button-container"
					onClick={() => setIsEditing(true)}>
					<PencilIcon />
				</button>
			);
		}

		return (
			<div className="tenant-detail__core-config-table__row-buttons">
				<Button
					size="sm"
					color="blue-outline"
					disabled={isLoading}
					onClick={handleCancelEdit}>
					Cancel
				</Button>
				<Button
					size="sm"
					isLoading={isLoading}
					disabled={isLoading}
					onClick={handleSaveProperty}
					color="secondary">
					Save
				</Button>
			</div>
		);
	};

	const renderUneditablePropertyReason = () => {
		if (isModifyableOnlyViaConfigYaml && isUsingSaaS) {
			return "This property cannot be modified since you are using the managed service.";
		}

		if (isSaaSProtected && isUsingSaaS) {
			return "This property cannot be edited or viewed since you are using a managed service and we hide it for security reasons.";
		}

		if ((isPublicTenant && !isUsingNonPublicApp) || isModifyableOnlyViaConfigYaml) {
			return isUsingSaaS
				? "To modify this property, please visit the dashboard on supertokens.com and click on the edit configuration button."
				: "This property is modifyable only via the config.yaml file or via Docker env variables.";
		}

		if (isUsingNonPublicApp && isPublicTenant) {
			return (
				<>
					You would need to use{" "}
					<a
						href="https://supertokens.com/docs/multitenancy/new-app#create-a-new--update-an-app-in-the-core"
						rel="noreferrer noopener"
						target="_blank">
						this core API
					</a>{" "}
					to update this property.
				</>
			);
		}

		if (isPluginProperty && !isPluginPropertyEditable) {
			return "This property is a database property that cannot be directly modified from the UI. Checkout the description for this section for more details.";
		}

		return isUsingSaaS
			? "You can modify this property via the SaaS dashboard."
			: "This property is modifyable only via the config.yaml file or via Docker env variables.";
	};

	return (
		<>
			<div className="tenant-detail__core-config-table__row">
				<div
					className={`tenant-detail__core-config-table__row-container ${
						isEditing ? "tenant-detail__core-config-table__row-container--editing" : ""
					} ${isUneditable ? "tenant-detail__core-config-table__row-container--uneditable" : ""}`}>
					<div className="tenant-detail__core-config-table__row-info">
						<div className="tenant-detail__core-config-table__row-name">
							{tooltip && (
								<TooltipContainer tooltip={`${tooltip}`}>
									<InfoIcon />
								</TooltipContainer>
							)}
							{name}
						</div>
						{renderConfigAction()}
					</div>
					<div
						className={`tenant-detail__core-config-table__row-value-container ${
							type === "boolean" || isMultiValue
								? "tenant-detail__core-config-table__row-value-container--toggle"
								: ""
						}`}>
						<label htmlFor={name}>Value:</label>
						<div className="tenant-detail__core-config-table__row-field-container">
							{isMultiValue && (
								<NativeSelect
									id={name}
									options={possibleValues}
									value={currentValue as string}
									disabled={!isEditing}
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
									disabled={!isEditing || currentValue === null}
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
									disabled={!isEditing}
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
									disabled={!isEditing}
									onChange={toggleNull}
								/>
							)}
						</div>
					</div>
				</div>
				{isUneditable && (
					<button
						className="tenant-detail__core-config-table__row-uneditable-button-container"
						onClick={() => setIsUneditablePropertyDialogVisible(true)}>
						<QuestionMarkIcon />
					</button>
				)}
			</div>
			{isUneditablePropertyDialogVisible && (
				<UneditablePropertyDialog onCloseDialog={() => setIsUneditablePropertyDialogVisible(false)}>
					{renderUneditablePropertyReason()}
				</UneditablePropertyDialog>
			)}
		</>
	);
};
