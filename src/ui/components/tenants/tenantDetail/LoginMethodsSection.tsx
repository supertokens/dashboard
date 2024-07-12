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
import { useUpdateFirstFactorService, useUpdateRequiredSecondaryFactorService } from "../../../../api/tenants";
import { ReactComponent as ErrorIcon } from "../../../../assets/form-field-error-icon.svg";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { FIRST_FACTOR_IDS, SECONDARY_FACTOR_IDS } from "../../../../constants";
import { getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { ErrorBlock } from "../../errorBlock/ErrorBlock";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";

export const LoginMethodsSection = () => {
	const { tenantInfo } = useTenantDetailContext();
	const [mfaError, setMfaError] = useState<null | "MFA_NOT_INITIALIZED" | "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN">(
		null
	);

	return (
		<>
			<PanelRoot>
				<PanelHeader>
					<PanelHeaderTitleWithTooltip tooltip="The login methods you want to enable for the tenant">
						Enabled Login Methods
					</PanelHeaderTitleWithTooltip>
				</PanelHeader>

				{tenantInfo.firstFactors.length === 0 && (
					<ErrorBlock className="tenant-detail__factors-error-block">
						At least one login method needs to be enabled for the user to log in to the tenant.
					</ErrorBlock>
				)}

				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{FIRST_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={method.id}
								type="first-factor"
								key={`first-factor-${method.id}`}
								label={method.label}
								description={method.description}
								checked={tenantInfo?.firstFactors.includes(method.id)}
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
				{mfaError === "MFA_NOT_INITIALIZED" && (
					<ErrorBlock className="tenant-detail__factors-error-block">
						You need to initialize the MFA recipe to use secondary factors.{" "}
						<a
							href="https://supertokens.com/docs/mfa/backend-setup"
							target="_blank"
							rel="noreferrer noopener">
							Click here
						</a>{" "}
						to see MFA docs for more info.
					</ErrorBlock>
				)}
				{mfaError === "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN" && (
					<ErrorBlock className="tenant-detail__factors-error-block">
						Please note that the MFA functions are overridden in the SDK and the required secondary factors
						settings will be based on the overridden logic.
					</ErrorBlock>
				)}
				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{SECONDARY_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={method.id}
								type="secondary-factor"
								key={`secondary-factor-${method.id}`}
								label={method.label}
								fixedGap
								description={method.description}
								checked={tenantInfo.requiredSecondaryFactors?.includes(method.id) ?? false}
								setMfaError={setMfaError}
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
	fixedGap,
	type,
	setMfaError,
}: {
	id: string;
	label: string;
	description: string;
	checked: boolean;
	fixedGap?: boolean;
	type: "first-factor" | "secondary-factor";
	setMfaError?: (error: null | "MFA_NOT_INITIALIZED" | "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN") => void;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const updateFirstFactors = useUpdateFirstFactorService();
	const updateSecondaryFactors = useUpdateRequiredSecondaryFactorService();
	const hasError = error !== null;
	const { showToast } = useContext(PopupContentContext);

	const handleFactorChange = async () => {
		const doesFactorExist = checked;

		try {
			setIsLoading(true);
			if (type === "first-factor") {
				const res = await updateFirstFactors(tenantInfo.tenantId, id, !doesFactorExist);
				if (res.status !== "OK") {
					if (res.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR") {
						setError(res.message);
					} else {
						throw new Error(res.status);
					}
				} else {
					setError(null);
				}
			} else {
				const res = await updateSecondaryFactors(tenantInfo.tenantId, id, !doesFactorExist);
				if (res.status !== "OK") {
					if (res.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR") {
						setError(res.message);
					} else if (res.status === "MFA_NOT_INITIALIZED_ERROR") {
						setMfaError!("MFA_NOT_INITIALIZED");
					} else {
						throw new Error(res.status);
					}
				} else {
					if (res.isMFARequirementsForAuthOverridden) {
						setMfaError!("MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN");
					} else {
						setError(null);
					}
				}

				// If this is not a MFA related error then clear the error
				if (
					(res.status === "OK" && !res.isMFARequirementsForAuthOverridden) ||
					res.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK_ERROR"
				) {
					setMfaError!(null);
				}
			}
		} catch (error) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children:
					(error as Error).message === "UNKNOWN_TENANT_ERROR" ? (
						<>Tenant does not exist</>
					) : (
						<>Something went wrong!</>
					),
			});
		} finally {
			setIsLoading(false);
			void refetchTenant();
		}
	};

	return (
		<div
			className={`tenant-detail__factors-container__grid__factor${
				fixedGap ? " tenant-detail__factors-container__grid__factor--fixed-gap" : ""
			}`}>
			<div className="tenant-detail__factors-container__grid__factor__label-container">
				<TooltipContainer
					tooltipWidth={hasError ? 350 : 200}
					position="bottom"
					tooltip={hasError ? error : description}
					error={hasError}>
					{hasError ? <ErrorIcon style={{ transform: "translateY(-1px)", width: "14px" }} /> : <InfoIcon />}
				</TooltipContainer>
				<div className="tenant-detail__factors-container__grid__factor__label-container__label">{label}:</div>
			</div>
			<Toggle
				checked={checked}
				onChange={handleFactorChange}
				id={`${type}-${id}`}
				disabled={isLoading}
			/>
		</div>
	);
};
