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
import { ReactComponent as PencilIcon } from "../../../../assets/edit-unfilled.svg";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { ReactComponent as QuestionMarkIcon } from "../../../../assets/question-mark.svg";
import { PUBLIC_TENANT_ID } from "../../../../constants";
import { getConnectionUri } from "../../../../utils";
// import { Checkbox } from "../../checkbox/Checkbox";
// import InputField from "../../inputField/InputField";
// import { NativeSelect } from "../../nativeSelect/NativeSelect";
// import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { EditCoreConfigPropertyDialog } from "./editCoreConfigPropertyDialog/EditCoreConfigPropertyDialog";
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
				<div className="tenant-detail__core-config-table__header">
					<div className="tenant-detail__core-config-table__header__item">Property name</div>
					<div className="tenant-detail__core-config-table__header__item">Value</div>
				</div>
				<div className="tenant-detail__core-config-table__body">
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
				</div>
			</div>
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
					<div className="tenant-detail__core-config-table">
						<div className="tenant-detail__core-config-table__header">
							<div className="tenant-detail__core-config-table__header__item">Property name</div>
							<div className="tenant-detail__core-config-table__header__item">Value</div>
						</div>
						<div className="tenant-detail__core-config-table__body">
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
						</div>

						{showPluginDialog && databaseType !== null && (
							<EditPluginPropertyDialog
								onCloseDialog={() => setShowPluginDialog(false)}
								tenantId={tenantInfo.tenantId}
								databaseType={databaseType}
							/>
						)}
					</div>
				</>
			)}
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
	defaultValue,
}: CoreConfigTableRowProps) => {
	const { tenantInfo } = useTenantDetailContext();
	const [isUneditablePropertyDialogVisible, setIsUneditablePropertyDialogVisible] = useState(false);
	const [isEditPropertyDialogVisible, setIsEditPropertyDialogVisible] = useState(false);
	const isPublicTenant = tenantInfo.tenantId === PUBLIC_TENANT_ID;

	const isUneditable =
		isPublicTenant ||
		(isPluginProperty && !isPluginPropertyEditable) ||
		isModifyableOnlyViaConfigYaml ||
		(isUsingSaaS && isSaaSProtected) ||
		(!isPublicTenant && !isDifferentAcrossTenants);

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
				<div className="tenant-detail__core-config-table__row__label-container">
					{tooltip && (
						<TooltipContainer
							tooltipWidth={465}
							tooltip={
								<>
									<b>{name}</b>
									<div style={{ height: 8 }} />
									{tooltip}
								</>
							}>
							<InfoIcon />
						</TooltipContainer>
					)}
					<div className="tenant-detail__core-config-table__row__label">{name}</div>
				</div>
				<div className="tenant-detail__core-config-table__row__value">
					<div className="tenant-detail__core-config-table__row__value__text">{`${value}`}</div>
					{isUneditable ? (
						<button
							className="tenant-detail__core-config-table__row__uneditable-button-container"
							onClick={() => setIsUneditablePropertyDialogVisible(true)}>
							<QuestionMarkIcon />
						</button>
					) : (
						<button
							className="tenant-detail__core-config-table__row__edit-button-container"
							onClick={() => setIsEditPropertyDialogVisible(true)}>
							<PencilIcon />
						</button>
					)}
				</div>
			</div>
			{isEditPropertyDialogVisible && (
				<EditCoreConfigPropertyDialog
					name={name}
					value={value}
					type={type}
					isNullable={isNullable}
					possibleValues={possibleValues}
					onCloseDialog={() => setIsEditPropertyDialogVisible(false)}
					defaultValue={defaultValue}
					description={tooltip}
				/>
			)}
			{isUneditablePropertyDialogVisible && (
				<UneditablePropertyDialog onCloseDialog={() => setIsUneditablePropertyDialogVisible(false)}>
					{renderUneditablePropertyReason()}
				</UneditablePropertyDialog>
			)}
		</>
	);
};
