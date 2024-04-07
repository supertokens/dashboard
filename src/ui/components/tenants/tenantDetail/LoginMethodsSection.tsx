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
import { useUpdateFirstFactorsService, useUpdateSecondaryFactorsService } from "../../../../api/tenants";
import { ReactComponent as ErrorIcon } from "../../../../assets/form-field-error-icon.svg";
import { ReactComponent as InfoIcon } from "../../../../assets/info-icon.svg";
import { FactorIds, FIRST_FACTOR_IDS, SECONDARY_FACTOR_IDS } from "../../../../constants";
import { doesTenantHasPasswordlessEnabled, getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { ErrorBlock } from "../../errorBlock/ErrorBlock";
import { Toggle } from "../../toggle/Toggle";
import TooltipContainer from "../../tooltip/tooltip";
import { useTenantDetailContext } from "./TenantDetailContext";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "./tenantDetailPanel/TenantDetailPanel";

export const LoginMethodsSection = () => {
	const { tenantInfo, setTenantInfo } = useTenantDetailContext();
	const updateFirstFactors = useUpdateFirstFactorsService();
	const updateSecondaryFactors = useUpdateSecondaryFactorsService();

	const [isFirstFactorsLoading, setIsFirstFactorsLoading] = useState(false);
	const [isSecondaryFactorsLoading, setIsSecondaryFactorsLoading] = useState(false);
	const [secondaryFactorsError, setSecondaryFactorsError] = useState<
		null | "MFA_NOT_INITIALIZED" | "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN"
	>(null);
	const [factorErrors, setFactorErrors] = useState<{
		firstFactors: Record<string, string>;
		requiredSecondaryFactors: Record<string, string>;
	}>({
		firstFactors: {},
		requiredSecondaryFactors: {},
	});

	const { showToast } = useContext(PopupContentContext);

	const doesTenantHasEmailPasswordAndPasswordlessEnabled =
		tenantInfo.firstFactors?.includes(FactorIds.EMAILPASSWORD) &&
		doesTenantHasPasswordlessEnabled(tenantInfo.firstFactors) &&
		!tenantInfo.firstFactors?.includes(FactorIds.THIRDPARTY);

	const handleFactorChange = async (factorKey: "firstFactors" | "requiredSecondaryFactors", id: string) => {
		const prevFactors = tenantInfo[factorKey] ?? [];
		let newFactors = [...prevFactors];
		const doesFactorExist = prevFactors.includes(id);
		if (doesFactorExist) {
			newFactors = newFactors.filter((factor) => factor !== id);
		} else {
			newFactors = [...newFactors, id];
		}
		// Optimistically update the state for better UX
		setTenantInfo((prev) =>
			prev
				? {
						...prev,
						[factorKey]: newFactors,
				  }
				: undefined
		);
		try {
			if (factorKey === "firstFactors") {
				setIsFirstFactorsLoading(true);
				const res = await updateFirstFactors(tenantInfo.tenantId, id, !doesFactorExist);
				if (res.status !== "OK") {
					// We revert the state in case of a non-OK response
					setTenantInfo((prev) =>
						prev
							? {
									...prev,
									firstFactors: prevFactors,
							  }
							: undefined
					);

					if (res.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK") {
						setFactorErrors((prev) => ({
							...prev,
							firstFactors: { ...prev.firstFactors, [id]: res.message },
						}));
					} else {
						throw new Error(res.status);
					}
				}
			} else {
				setIsSecondaryFactorsLoading(true);
				const res = await updateSecondaryFactors(tenantInfo.tenantId, id, !doesFactorExist);
				if (res.status !== "OK") {
					if (res.status === "RECIPE_NOT_CONFIGURED_ON_BACKEND_SDK") {
						setFactorErrors((prev) => ({
							...prev,
							requiredSecondaryFactors: { ...prev.requiredSecondaryFactors, [id]: res.message },
						}));
					} else if (
						res.status === "MFA_NOT_INITIALIZED" ||
						res.status === "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN"
					) {
						setSecondaryFactorsError(res.status);
					} else {
						throw new Error(res.status);
					}

					// We allow users to update secondary factors even if
					// getMFARequirementsForAuth is overridden
					if (res.status !== "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN") {
						// We revert the state in case of a non-OK response
						setTenantInfo((prev) =>
							prev
								? {
										...prev,
										requiredSecondaryFactors: prevFactors,
								  }
								: undefined
						);
					}
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
			setIsFirstFactorsLoading(false);
			setIsSecondaryFactorsLoading(false);
		}
	};

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

				{doesTenantHasEmailPasswordAndPasswordlessEnabled && (
					<div className="block-warn block-warn-medium text-small tenant-detail__factors-error-block">
						<b>Note:</b> Pre-built might not work as expected because we don’t have a combination recipe for
						EmailPassword and Passwordless yet.
					</div>
				)}

				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{FIRST_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={`first-factor-${method.id}`}
								key={`first-factor-${method.id}`}
								label={method.label}
								disabled={isFirstFactorsLoading}
								description={method.description}
								error={factorErrors.firstFactors[method.id]}
								checked={tenantInfo.firstFactors.includes(method.id)}
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
				{secondaryFactorsError === "MFA_NOT_INITIALIZED" && (
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
				{secondaryFactorsError === "MFA_REQUIREMENTS_FOR_AUTH_OVERRIDDEN" && (
					<ErrorBlock className="tenant-detail__factors-error-block">
						Setting secondary factors might not take effect as <b>getMFARequirementsForAuth</b> has been
						overridden in the SDK. To be able to modify the secondary factors from the UI you would need to
						remove the custom function that you have added.
					</ErrorBlock>
				)}
				<div className="tenant-detail__factors-container">
					<div className="tenant-detail__factors-container__grid">
						{SECONDARY_FACTOR_IDS.map((method) => (
							<LoginFactor
								id={`secondary-factor-${method.id}`}
								key={`secondary-factor-${method.id}`}
								label={method.label}
								disabled={isSecondaryFactorsLoading}
								fixedGap
								description={method.description}
								error={factorErrors.requiredSecondaryFactors[method.id]}
								checked={tenantInfo.requiredSecondaryFactors?.includes(method.id) ?? false}
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
	error,
	checked,
	onChange,
	fixedGap,
	disabled,
}: {
	id: string;
	label: string;
	description: string;
	error?: string;
	checked: boolean;
	onChange: () => void;
	fixedGap?: boolean;
	disabled?: boolean;
}) => {
	const hasError = typeof error === "string";
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
				onChange={onChange}
				id={id}
				disabled={disabled}
			/>
		</div>
	);
};
