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
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { ReactComponent as RightArrow } from "../../../../assets/right_arrow_icon.svg";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import InputField from "../../inputField/InputField";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import {
	PanelHeader,
	PanelHeaderAction,
	PanelHeaderTitleWithTooltip,
	PanelRoot,
} from "./tenantDetailPanel/TenantDetailPanel";

export const CoreConfigSection = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [isSavingProperties, setIsSavingProperties] = useState(false);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const { showToast } = useContext(PopupContentContext);
	const [currentConfig, setCurrentConfig] = useState(tenantInfo?.coreConfig ?? {});
	const [configErrors, setConfigErrors] = useState<Record<string, string>>({});
	const hasProperties = Object.keys(tenantInfo?.coreConfig ?? {}).length > 0;

	// Ensure that the state reflects the latest core config
	useEffect(() => {
		setCurrentConfig(tenantInfo.coreConfig);
	}, [tenantInfo.coreConfig]);

	const handleSave = async () => {
		// const errors = Object.entries(currentConfig).reduce((acc: Record<string, string>, [key, value]) => {
		// 	const propertyObj = coreConfigOptions.find((property) => property.name === key);
		// 	if (value === "" || value === undefined) {
		// 		acc[key] = "Value cannot be empty";
		// 		return acc;
		// 	}
		// 	if (propertyObj?.type === "number" && isNaN(Number(value))) {
		// 		acc[key] = "Value must be a number";
		// 		return acc;
		// 	}
		// 	return acc;
		// }, {});
		// setConfigErrors(errors);
		// if (Object.keys(errors).length > 0) {
		// 	return;
		// }
		// try {
		// 	const parsedConfig = Object.entries(currentConfig).reduce((acc: Record<string, unknown>, [key, value]) => {
		// 		const propertyObj = coreConfigOptions.find((property) => property.name === key);
		// 		if (propertyObj?.type === "number") {
		// 			acc[key] = Number(value);
		// 		} else {
		// 			acc[key] = value;
		// 		}
		// 		return acc;
		// 	}, {});
		// 	setIsSavingProperties(true);
		// 	await updateTenant(tenantInfo.tenantId, {
		// 		coreConfig: parsedConfig,
		// 	});
		// 	setIsEditing(false);
		// 	await refetchTenant();
		// } catch (_) {
		// 	showToast({
		// 		iconImage: getImageUrl("form-field-error-icon.svg"),
		// 		toastType: "error",
		// 		children: <>Something went wrong!, Failed to save config</>,
		// 	});
		// } finally {
		// 	setIsSavingProperties(false);
		// }
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip tooltip="Customize the supertokens core settings that you want to use for your tenant.">
					Core Config
				</PanelHeaderTitleWithTooltip>
				{hasProperties && (
					<PanelHeaderAction
						setIsEditing={setIsEditing}
						isEditing={isEditing}
						isSaving={isSavingProperties}
						handleSave={handleSave}
					/>
				)}
			</PanelHeader>
			{!hasProperties ? (
				<div className="block-info block-medium text-small tenant-detail__no-config-info-block">
					<div className="tenant-detail__no-config-info-block__no-property-pill">No Property Added</div>
					<p>
						There are no core config properties added by you for this tenant. You can click below to add new
						property or{" "}
						<a
							target="_blank"
							rel="noreferrer noopener"
							href="https://github.com/supertokens/supertokens-core/blob/master/config.yaml">
							click here
						</a>{" "}
						to see the list of all available core config property options.
					</p>
				</div>
			) : (
				<div className="tenant-detail__core-config-table">
					<div className="tenant-detail__core-config-table__header">
						<div className="tenant-detail__core-config-table__header__item">Property name</div>
						<div className="tenant-detail__core-config-table__header__item">Value</div>
					</div>
					<div className="tenant-detail__core-config-table__body">
						{Object.entries(currentConfig).map(([name, value]) => {
							const propertyObj = undefined;
							if (propertyObj === undefined) {
								return null;
							}
							return <></>;
						})}
					</div>
				</div>
			)}
			<div className="tenant-detail__core-config-footer">
				{hasProperties && (
					<a
						className="tenant-detail__core-config-footer__footer-link"
						target="_blank"
						rel="noreferrer noopener"
						href="https://github.com/supertokens/supertokens-core/blob/master/config.yaml">
						See all config properties <RightArrow />
					</a>
				)}
			</div>
		</PanelRoot>
	);
};

type CoreConfigTableRowProps = {
	name: string;
	value: string | number | boolean;
	type: "string" | "boolean" | "number" | "enum";
	handleChange: (name: string, newValue: string | number | boolean) => void;
	isEditing: boolean;
	tooltip?: string;
	error?: string;
};

const CoreConfigTableRow = ({
	name,
	value,
	tooltip,
	type,
	isEditing,
	handleChange,
	error,
}: CoreConfigTableRowProps) => {
	return (
		<div className="tenant-detail__core-config-table__row">
			<div className="tenant-detail__core-config-table__row__label">
				{name}
				{tooltip && (
					<TooltipContainer tooltip={tooltip}>
						<InfoIcon />
					</TooltipContainer>
				)}
			</div>
			<div className="tenant-detail__core-config-table__row__value">
				{(type === "string" || type === "number") &&
					(isEditing ? (
						<InputField
							type="text"
							size="small"
							errorPlacement="prefix-tooltip"
							error={error}
							name={name}
							handleChange={(e) => {
								if (e.type === "change") {
									handleChange(name, e.currentTarget.value);
								}
							}}
							value={`${value}`}
						/>
					) : (
						<div className="tenant-detail__core-config-table__row__value__text">{value}</div>
					))}
				{typeof value === "boolean" && type === "boolean" && (
					<Toggle
						name={name}
						id={name}
						checked={value}
						disabled={!isEditing}
						onChange={() => handleChange(name, !value)}
					/>
				)}
			</div>
		</div>
	);
};
