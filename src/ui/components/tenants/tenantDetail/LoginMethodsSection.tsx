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
import { ReactComponent as ErrorIcon } from "../../../../assets/form-field-error-icon.svg";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { FIRST_FACTOR_IDS, SECONDARY_FACTOR_IDS } from "../../../../constants";
import { debounce, getImageUrl, getInitializedRecipes } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { ErrorBlock } from "../../errorBlock/ErrorBlock";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";

export const LoginMethodsSection = () => {
	const { tenantInfo, setTenantInfo } = useTenantDetailContext();
	const { updateTenant } = useTenantService();
	const [selectedFactors, setSelectedFactors] = useState<{
		firstFactors: Array<string>;
		requiredSecondaryFactors: Array<string>;
	}>({
		firstFactors: tenantInfo.validFirstFactors ?? [],
		requiredSecondaryFactors: tenantInfo.requiredSecondaryFactors ?? [],
	});

	const { showToast } = useContext(PopupContentContext);

	const hasSelectedSecondaryFactors = selectedFactors.requiredSecondaryFactors.length > 0;

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
					firstFactors:
						Array.isArray(factors.firstFactors) && factors.firstFactors.length > 0
							? factors.firstFactors
							: null,
					requiredSecondaryFactors:
						Array.isArray(factors.requiredSecondaryFactors) && factors.requiredSecondaryFactors.length > 0
							? factors.requiredSecondaryFactors
							: null,
					...enabledLoginMethods,
				})
					.then((res) => {
						if (res.status !== "OK") {
							throw new Error("Failed to update tenant");
						}
						setTenantInfo({
							...currentTenantInfo,
							firstFactors: factors.firstFactors,
							validFirstFactors: factors.firstFactors,
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
							firstFactors: currentTenantInfo.validFirstFactors ?? [],
							requiredSecondaryFactors: currentTenantInfo.requiredSecondaryFactors ?? [],
						});

						showToast({
							iconImage: getImageUrl("form-field-error-icon.svg"),
							toastType: "error",
							children: <>Something went wrong Please try again!</>,
						});
					});
			},
			400
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

				{selectedFactors.firstFactors.length === 0 && (
					<ErrorBlock className="tenant-detail__factors-error-block">
						At least one login method needs to be enabled for the user to log in to the tenant.
					</ErrorBlock>
				)}

				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{FIRST_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={`first-factor-${method.id}`}
								key={`first-factor-${method.id}`}
								label={method.label}
								factorId={method.id}
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
				{hasSelectedSecondaryFactors && (
					<div className="block-warn block-warn-medium text-small tenant-detail__secondary-factors-warn-block">
						<p>
							<b>Note</b>: MFA recipe needs to be added to the backend and frontend SDK to enable the
							required secondary factors.
						</p>
					</div>
				)}
				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{SECONDARY_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={`secondary-factor-${method.id}`}
								key={`secondary-factor-${method.id}`}
								label={method.label}
								factorId={method.id}
								fixedGap
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
	fixedGap,
	factorId,
}: {
	id: string;
	label: string;
	description: string;
	checked: boolean;
	onChange: () => void;
	fixedGap?: boolean;
	factorId: string;
}) => {
	const hasError = checked && !doesFactorHasRecipeInitialized(factorId);
	return (
		<div
			className={`tenant-detail__factors-container__grid__factor${
				fixedGap ? " tenant-detail__factors-container__grid__factor--fixed-gap" : ""
			}`}>
			<div className="tenant-detail__factors-container__grid__factor__label-container">
				<TooltipContainer
					tooltipWidth={200}
					position="bottom"
					tooltip={description}
					error={hasError}>
					{hasError ? <ErrorIcon style={{ transform: "translateY(-1px)" }} /> : <InfoIcon />}
				</TooltipContainer>
				<div className="tenant-detail__factors-container__grid__factor__label-container__label">{label}:</div>
			</div>
			<Toggle
				checked={checked}
				onChange={onChange}
				id={id}
			/>
		</div>
	);
};

const doesFactorHasRecipeInitialized = (factorId: string) => {
	const initializedRecipes = getInitializedRecipes();

	if (factorId === "emailpassword") {
		return initializedRecipes.emailPassword;
	}

	if (factorId === "thirdparty") {
		return initializedRecipes.thirdParty;
	}

	if (["otp-email", "otp-phone", "link-email", "link-phone"].includes(factorId)) {
		if (!initializedRecipes.passwordless) {
			return false;
		}
		if (factorId === "otp-email") {
			return (
				(initializedRecipes.passwordless.contactMethod === "EMAIL" ||
					initializedRecipes.passwordless.contactMethod === "EMAIL_OR_PHONE") &&
				(initializedRecipes.passwordless.flowType === "USER_INPUT_CODE" ||
					initializedRecipes.passwordless.flowType === "USER_INPUT_CODE_AND_MAGIC_LINK")
			);
		}

		if (factorId === "otp-phone") {
			return (
				(initializedRecipes.passwordless.contactMethod === "PHONE" ||
					initializedRecipes.passwordless.contactMethod === "EMAIL_OR_PHONE") &&
				(initializedRecipes.passwordless.flowType === "USER_INPUT_CODE" ||
					initializedRecipes.passwordless.flowType === "USER_INPUT_CODE_AND_MAGIC_LINK")
			);
		}

		if (factorId === "link-email") {
			return (
				(initializedRecipes.passwordless.contactMethod === "EMAIL" ||
					initializedRecipes.passwordless.contactMethod === "EMAIL_OR_PHONE") &&
				(initializedRecipes.passwordless.flowType === "MAGIC_LINK" ||
					initializedRecipes.passwordless.flowType === "USER_INPUT_CODE_AND_MAGIC_LINK")
			);
		}

		if (factorId === "link-phone") {
			return (
				(initializedRecipes.passwordless.contactMethod === "PHONE" ||
					initializedRecipes.passwordless.contactMethod === "EMAIL_OR_PHONE") &&
				(initializedRecipes.passwordless.flowType === "MAGIC_LINK" ||
					initializedRecipes.passwordless.flowType === "USER_INPUT_CODE_AND_MAGIC_LINK")
			);
		}
	}

	if (factorId === "totp") {
		return initializedRecipes.totp;
	}

	return false;
};
