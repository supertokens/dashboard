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
import { useCallback, useContext, useState } from "react";
import { useTenantService } from "../../../../api/tenants";
import { TenantInfo } from "../../../../api/tenants/types";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { debounce, getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";

const FIRST_FACTOR_IDS = [
	{
		label: "Email Password",
		description: "Sign in/up using email and password (Requires the EmailPassword recipe to be enabled)",
		id: "emailpassword",
		loginMethod: "emailpassword",
	},
	{
		label: "OTP - Email",
		description: "Sign in/up using OTP sent to email (Requires the Passwordless recipe to be enabled)",
		id: "otp-email",
		loginMethod: "passwordless",
	},
	{
		label: "OTP - Phone",
		description: "Sign in/up using OTP sent to phone (Requires the Passwordless recipe to be enabled)",
		id: "otp-phone",
		loginMethod: "passwordless",
	},
	{
		label: "Third Party",
		description: "Sign in/up using third party providers (Requires the ThirdParty recipe to be enabled)",
		id: "thirdparty",
		loginMethod: "thirdparty",
	},
	{
		label: "Link - Email",
		description: "Sign in/up using link sent to email (Requires the Passwordless recipe to be enabled)",
		id: "link-email",
		loginMethod: "passwordless",
	},
	{
		label: "Link - Phone",
		description: "Sign in/up using link sent to phone (Requires the Passwordless recipe to be enabled)",
		id: "link-phone",
		loginMethod: "passwordless",
	},
];

const SECONDARY_FACTOR_IDS = [
	{
		label: "TOTP",
		description:
			"Require TOTP as a secondary factor for successful authentication (Requires the TOTP recipe to be enabled)",
		id: "totp",
	},
	{
		label: "OTP - Email",
		description:
			"Require OTP sent to email as a secondary factor for successful authentication (Requires the Passwordless recipe to be enabled)",
		id: "otp-email",
		loginMethod: "passwordless",
	},
	{
		label: "OTP - Phone",
		description:
			"Require OTP sent to phone as a secondary factor for successful authentication (Requires the Passwordless recipe to be enabled)",
		id: "otp-phone",
		loginMethod: "passwordless",
	},
];

export const LoginMethodsSection = () => {
	const { tenantInfo, setTenantInfo } = useTenantDetailContext();
	const { updateTenant } = useTenantService();
	const [selectedFactors, setSelectedFactors] = useState<{
		firstFactors: Array<string>;
		requiredSecondaryFactors: Array<string>;
	}>({
		firstFactors: tenantInfo.firstFactors ?? [],
		requiredSecondaryFactors: tenantInfo.requiredSecondaryFactors ?? [],
	});

	const { showToast } = useContext(PopupContentContext);

	const debouncedUpdateTenant = useCallback(
		debounce(
			(
				tenantId: string,
				factors: {
					firstFactors: Array<string>;
					requiredSecondaryFactors: Array<string>;
				},
				currentTenantInfo: TenantInfo,
				setTenantInfo: (tenantInfo: TenantInfo) => void
			) => {
				const enabledLoginMethods = {
					emailPasswordEnabled:
						FIRST_FACTOR_IDS.some(
							(factor) =>
								factor.loginMethod === "emailpassword" && factors.firstFactors.includes(factor.id)
						) ||
						SECONDARY_FACTOR_IDS.some(
							(factor) =>
								factor.loginMethod === "emailpassword" &&
								factors.requiredSecondaryFactors.includes(factor.id)
						),
					passwordlessEnabled:
						FIRST_FACTOR_IDS.some(
							(factor) =>
								factor.loginMethod === "passwordless" && factors.firstFactors.includes(factor.id)
						) ||
						SECONDARY_FACTOR_IDS.some(
							(factor) =>
								factor.loginMethod === "passwordless" &&
								factors.requiredSecondaryFactors.includes(factor.id)
						),
					thirdPartyEnabled:
						FIRST_FACTOR_IDS.some(
							(factor) => factor.loginMethod === "thirdparty" && factors.firstFactors.includes(factor.id)
						) ||
						SECONDARY_FACTOR_IDS.some(
							(factor) =>
								factor.loginMethod === "thirdparty" &&
								factors.requiredSecondaryFactors.includes(factor.id)
						),
				};

				updateTenant(tenantId, {
					...factors,
					...enabledLoginMethods,
				})
					.then((res) => {
						if (res.status !== "OK") {
							throw new Error("Failed to update tenant");
						}
						setTenantInfo({
							...currentTenantInfo,
							firstFactors: factors.firstFactors,
							requiredSecondaryFactors: factors.requiredSecondaryFactors,
							emailPassword: {
								enabled: enabledLoginMethods.emailPasswordEnabled,
							},
							passwordless: {
								enabled: enabledLoginMethods.passwordlessEnabled,
							},
							thirdParty: {
								...currentTenantInfo.thirdParty,
								enabled: enabledLoginMethods.thirdPartyEnabled,
							},
						});
					})
					.catch((_) => {
						// Revert the state back to the original state in case of error
						setSelectedFactors({
							firstFactors: currentTenantInfo.firstFactors ?? [],
							requiredSecondaryFactors: currentTenantInfo.requiredSecondaryFactors ?? [],
						});

						showToast({
							iconImage: getImageUrl("form-field-error-icon.svg"),
							toastType: "error",
							children: <>Something went wrong Please try again!</>,
						});
					});
			},
			200
		),
		[]
	);

	const handleFactorChange = (factorKey: "firstFactors" | "requiredSecondaryFactors", id: string) => {
		const newFactors = { ...selectedFactors };
		if (newFactors[factorKey].includes(id)) {
			newFactors[factorKey] = newFactors[factorKey].filter((factor) => factor !== id);
		} else {
			newFactors[factorKey] = [...newFactors[factorKey], id];
		}
		setSelectedFactors(newFactors);
		void debouncedUpdateTenant(tenantInfo.tenantId, newFactors, tenantInfo, setTenantInfo);
	};

	return (
		<>
			<PanelRoot>
				<PanelHeader>
					<PanelHeaderTitleWithTooltip tooltip="The login methods you want to enable for the tenant">
						Enabled Login Methods
					</PanelHeaderTitleWithTooltip>
				</PanelHeader>
				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{FIRST_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={`first-factor-${method.id}`}
								key={`first-factor-${method.id}`}
								label={method.label}
								description={method.description}
								checked={selectedFactors.firstFactors.includes(method.id)}
								onChange={() => handleFactorChange("firstFactors", method.id)}
							/>
						))}
					</div>
				</div>
			</PanelRoot>

			<PanelRoot>
				<PanelHeader>
					<PanelHeaderTitleWithTooltip tooltip="The secondary factors that would be required after logging in for successful authentation for this tenant">
						Secondary Factors
					</PanelHeaderTitleWithTooltip>
				</PanelHeader>
				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{SECONDARY_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={`secondary-factor-${method.id}`}
								key={`secondary-factor-${method.id}`}
								label={method.label}
								description={method.description}
								checked={selectedFactors.requiredSecondaryFactors.includes(method.id)}
								onChange={() => handleFactorChange("requiredSecondaryFactors", method.id)}
							/>
						))}
					</div>
				</div>
			</PanelRoot>
		</>
	);
};

const LoginFactor = ({
	id,
	label,
	description,
	checked,
	onChange,
}: {
	id: string;
	label: string;
	description: string;
	checked: boolean;
	onChange: () => void;
}) => {
	return (
		<div className="tenant-detail__factors-container__grid__factor">
			<div className="tenant-detail__factors-container__grid__factor__label-container">
				<TooltipContainer
					tooltipWidth={200}
					position="bottom"
					tooltip={description}>
					<InfoIcon />
				</TooltipContainer>
				<div className="tenant-detail__factors-container__grid__factor__label-container__label">{label}</div>
			</div>
			<Toggle
				checked={checked}
				onChange={onChange}
				id={id}
			/>
		</div>
	);
};
