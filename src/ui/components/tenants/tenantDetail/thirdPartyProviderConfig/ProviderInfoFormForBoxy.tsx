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
import { useCreateOrUpdateThirdPartyProviderService } from "../../../../../api/tenants";
import { ProviderConfig, ProviderConfigResponse } from "../../../../../api/tenants/types";
import { SAML_PROVIDER_ID } from "../../../../../constants";
import { getImageUrl, isValidHttpUrl } from "../../../../../utils";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { DeleteCrossButton } from "../../../deleteCrossButton/DeleteCrossButton";
import TooltipContainer from "../../../tooltip/tooltip";
import { useTenantDetailContext } from "../TenantDetailContext";
import { DeleteThirdPartyProviderDialog } from "../deleteThirdPartyProvider/DeleteThirdPartyProvider";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import {
	ThirdPartyProviderInput,
	ThirdPartyProviderInputLabel,
} from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import "./thirdPartyProviderConfig.scss";

const samlProviderOptions = [
	"Microsoft Entra ID",
	"Microsoft AD FS",
	"Okta",
	"Auth0",
	"Google",
	"OneLogin",
	"PingOne",
	"JumpCloud",
	"Rippling",
	"SAML",
];

export const ProviderInfoFormForBoxy = ({
	providerId,
	providerConfig,
	handleGoBack,
	isAddingNewProvider,
}: {
	providerId?: string;
	isAddingNewProvider: boolean;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
	providerConfig?: ProviderConfigResponse;
}) => {
	const [providerConfigState, setProviderConfigState] = useState(getInitialProviderInfo(providerConfig, providerId));
	const [errorState, setErrorState] = useState<Record<string, string>>({});
	const [isSuffixFieldVisible, setIsSuffixFieldVisible] = useState(false);
	const [isDeleteProviderDialogOpen, setIsDeleteProviderDialogOpen] = useState(false);
	const { tenantInfo, refetchTenant } = useTenantDetailContext();
	const [isSaving, setIsSaving] = useState(false);
	const { showToast } = useContext(PopupContentContext);
	const createOrUpdateThirdPartyProvider = useCreateOrUpdateThirdPartyProviderService();
	const isSAMLProvider = providerId?.startsWith(SAML_PROVIDER_ID);
	const hasBoxyAPIKey =
		providerConfigState.clients?.[0]?.additionalConfig?.boxyAPIKey !== undefined &&
		providerConfigState.clients?.[0]?.additionalConfig?.boxyAPIKey !== "" &&
		providerConfigState.clients?.[0]?.additionalConfig?.boxyAPIKey !== null;
	const [samlInputType, setSamlInputType] = useState<"xml" | "url" | "manual">(() => {
		if (!hasBoxyAPIKey) {
			return "manual";
		}
		return (
			(providerConfigState.clients![0]?.additionalConfig?.samlInputType as "xml" | "url" | "manual") || "manual"
		);
	});
	const baseProviderId = SAML_PROVIDER_ID;
	const shouldUsePrefixField = isAddingNewProvider && isSAMLProvider;

	const handleFieldChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		if (e.type === "change") {
			setProviderConfigState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
		}
	};

	const handleRedirectURLsChange = (urls: string[]) => {
		setProviderConfigState({
			...providerConfigState,
			clients: (providerConfigState.clients ?? []).map((client) => {
				return {
					...client,
					additionalConfig: {
						...client.additionalConfig,
						redirectURLs: urls,
					},
				};
			}),
		});
	};

	const handleSamlInputChange = (e: ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
		if (e.type === "change") {
			if (samlInputType !== "xml" && samlInputType !== "url") {
				throw new Error("should never happen");
			}
			setProviderConfigState((prev) => ({
				...prev,
				clients: prev.clients!.map((client, index) =>
					index === 0
						? {
								...client,
								additionalConfig: {
									...client.additionalConfig,
									[samlInputType === "xml" ? "samlXML" : "samlURL"]: e.target.value,
								},
						  }
						: client
				),
			}));
		}
	};

	const handleSamlInputTypeChange = (type: "xml" | "url" | "manual") => {
		if (!hasBoxyAPIKey) {
			return;
		}
		setSamlInputType(type);
		setProviderConfigState((prev) => ({
			...prev,
			clients: prev.clients!.map((client, index) =>
				index === 0
					? {
							...client,
							additionalConfig: {
								...client.additionalConfig,
								samlInputType: type,
							},
					  }
					: client
			),
		}));
	};

	const handleThirdPartyIdSuffixChange = (
		e: ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
	) => {
		if (e.type !== "change") {
			return;
		}

		if (e.target.value.trim() === "") {
			setProviderConfigState((prev) => ({ ...prev, thirdPartyId: baseProviderId }));
		} else {
			setProviderConfigState((prev) => ({
				...prev,
				thirdPartyId: `${baseProviderId}-${e.target.value.trim()}`,
			}));
		}
	};

	const showSuffixField = () => {
		setIsSuffixFieldVisible(true);
		setProviderConfigState((prev) => ({
			...prev,
			thirdPartyId: `${baseProviderId}`,
		}));
		setErrorState((prev) => {
			const { thirdPartyId: _, ...rest } = prev;
			return rest;
		});
	};

	const handleSave = async () => {
		setErrorState({});

		if (providerConfigState === undefined) {
			throw new Error("should never happen!");
		}

		let isValid = true;
		const doesThirdPartyIdExist = tenantInfo.thirdParty.providers.some(
			(provider) => provider.thirdPartyId === providerConfigState.thirdPartyId
		);

		if (providerConfigState.thirdPartyId.trim() === "") {
			setErrorState((prev) => ({ ...prev, thirdPartyId: "Third Party Id is required" }));
			isValid = false;
		} else if (!providerConfigState.thirdPartyId.match(/^[a-z0-9-]+$/)) {
			setErrorState((prev) => ({
				...prev,
				thirdPartyId: "Third Party Id can only contain lowercase alphabets, numbers and hyphens",
			}));
			isValid = false;
		} else if (doesThirdPartyIdExist && isAddingNewProvider) {
			setErrorState((prev) => ({
				...prev,
				thirdPartyId:
					"Another provider with this third party id already exists, please enter a unique third party id or a unique suffix if adding a built-in provider.",
			}));
			isValid = false;
		}

		if (providerConfigState.name!.trim() === "") {
			setErrorState((prev) => ({ ...prev, name: "Name is required" }));
			isValid = false;
		}

		if (samlInputType === "xml" || samlInputType === "url") {
			const redirectURLs = (providerConfigState.clients![0].additionalConfig?.redirectURLs || []) as string[];
			const filteredRedirectURLs = redirectURLs.filter((url) => url.trim() !== "");

			if (filteredRedirectURLs.length === 0) {
				setErrorState((prev) => ({ ...prev, redirectURLs: "At least one redirect URL is required" }));
				isValid = false;
			} else {
				const invalidURLs = filteredRedirectURLs.filter((url) => !isValidHttpUrl(url));
				if (invalidURLs.length > 0) {
					setErrorState((prev) => ({ ...prev, redirectURLs: "One or more redirect URLs are invalid" }));
					isValid = false;
				}
			}

			if (
				samlInputType === "xml" &&
				(!providerConfigState.clients![0].additionalConfig?.samlXML ||
					providerConfigState.clients![0].additionalConfig.samlXML.trim() === "")
			) {
				setErrorState((prev) => ({ ...prev, samlXML: "SAML XML is required" }));
				isValid = false;
			}

			if (
				samlInputType === "url" &&
				(!providerConfigState.clients![0].additionalConfig?.samlURL ||
					!isValidHttpUrl(providerConfigState.clients![0].additionalConfig.samlURL))
			) {
				setErrorState((prev) => ({ ...prev, samlURL: "A valid SAML URL is required" }));
				isValid = false;
			}
		}

		if (!isValid) {
			return;
		}

		const normalizedProviderConfig = {
			thirdPartyId: providerConfigState.thirdPartyId,
			name: providerConfigState.name!.trim(),
			clients: providerConfigState.clients!.map((client) => ({
				clientId: client.clientId?.trim() || "dummy",
				clientSecret: client.clientSecret?.trim() || "dummy",
				additionalConfig: {
					...client.additionalConfig,
					samlInputType: samlInputType,
					samlXML: samlInputType === "xml" ? client.additionalConfig?.samlXML : undefined,
					samlURL: samlInputType === "url" ? client.additionalConfig?.samlURL : undefined,
				},
			})),
		};

		try {
			setIsSaving(true);
			const resp = await createOrUpdateThirdPartyProvider(
				tenantInfo.tenantId,
				normalizedProviderConfig as ProviderConfig
			);
			if (resp.status === "OK") {
				await refetchTenant();
				handleGoBack(true);
			} else if (resp.status === "BOXY_ERROR") {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Error from boxy: {resp.message}</>,
				});
			}
		} catch (e) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong!, Failed to save the provider!</>,
			});
		} finally {
			setIsSaving(false);
			window.scrollTo(0, 0);
		}
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="custom-provider-config-header">
					<div className="custom-provider-config-header__title">
						<PanelHeaderTitleWithTooltip>
							{isAddingNewProvider ? "Configure new provider" : "Provider Configuration"}
						</PanelHeaderTitleWithTooltip>
						{isSAMLProvider && (
							<ThirdPartyProviderButton
								title="SAML"
								icon="saml-icon.svg"
								disabled
							/>
						)}
					</div>
					{!isAddingNewProvider && (
						<Button
							color="danger"
							onClick={() => setIsDeleteProviderDialogOpen(true)}>
							Delete
						</Button>
					)}
				</div>
			</PanelHeader>
			<div className="fields-container">
				{shouldUsePrefixField ? (
					isSuffixFieldVisible ? (
						<ThirdPartyProviderInput
							label="Third Party Id"
							tooltip="The Id of the provider."
							prefix={`${baseProviderId}-`}
							type="text"
							name="thirdPartyId"
							value={providerConfigState.thirdPartyId.slice(baseProviderId.length + 1)}
							forceShowError
							error={errorState.thirdPartyId}
							handleChange={handleThirdPartyIdSuffixChange}
						/>
					) : (
						<div className="suffix-preview-field">
							<ThirdPartyProviderInputLabel
								label="Third Party Id"
								tooltip="The Id of the provider."
								minLabelWidth={120}
							/>
							<div className="suffix-preview-container">
								<div className="suffix-preview-container__suffix">
									<span className="prefix-preview">{baseProviderId}</span>
									<div className="suffix-button-container">
										<button onClick={showSuffixField}>+ Add suffix</button>
										<TooltipContainer tooltip="You can add multiple providers of the same type by adding a unique suffix to the third party id.">
											<span className="suffix-button-container__help-icon">
												<img
													src={getImageUrl("help-circle.svg")}
													alt="help"
												/>
											</span>
										</TooltipContainer>
									</div>
								</div>
								{errorState.thirdPartyId && (
									<div className="suffix-preview-container__error">{errorState.thirdPartyId}</div>
								)}
							</div>
						</div>
					)
				) : (
					<ThirdPartyProviderInput
						label="Third Party Id"
						tooltip="The Id of the provider."
						type="text"
						name="thirdPartyId"
						value={providerConfigState.thirdPartyId}
						disabled={!isAddingNewProvider}
						error={errorState.thirdPartyId}
						forceShowError
						isRequired
						handleChange={handleFieldChange}
						minLabelWidth={120}
					/>
				)}
				<ThirdPartyProviderInput
					label="Name"
					tooltip="The name of the provider."
					type="text"
					name="name"
					options={providerConfigState.thirdPartyId.startsWith("boxy-saml") ? samlProviderOptions : undefined}
					error={errorState.name}
					forceShowError
					value={providerConfigState.name}
					minLabelWidth={120}
					handleChange={handleFieldChange}
					isRequired
				/>
				<div className="saml-input-type">
					<ThirdPartyProviderInputLabel
						label="SAML Input Type"
						tooltip="Select XML or URL"
					/>
					<div className="saml-input-type__options">
						<label>
							<input
								type="radio"
								value="xml"
								checked={samlInputType === "xml"}
								onChange={() => handleSamlInputTypeChange("xml")}
							/>
							XML
						</label>
						<label>
							<input
								type="radio"
								value="url"
								checked={samlInputType === "url"}
								onChange={() => handleSamlInputTypeChange("url")}
							/>
							URL
						</label>
						<label>
							<input
								type="radio"
								value="manual"
								checked={samlInputType === "manual"}
								onChange={() => handleSamlInputTypeChange("manual")}
							/>
							Manual
						</label>
					</div>
				</div>
				{(samlInputType === "xml" || samlInputType === "url") && (
					<>
						<div>
							<RedirectURLs
								redirectURLs={providerConfigState?.clients![0].additionalConfig?.redirectURLs ?? [""]}
								setRedirectURLs={handleRedirectURLsChange}
							/>
						</div>
						{samlInputType === "xml" ? (
							<ThirdPartyProviderInput
								label="SAML XML"
								tooltip="The SAML XML configuration."
								type="multiline"
								name="samlXML"
								isRequired={true}
								value={providerConfigState.clients![0].additionalConfig?.samlXML || ""}
								handleChange={handleSamlInputChange}
								minLabelWidth={120}
							/>
						) : (
							<ThirdPartyProviderInput
								label="SAML URL"
								tooltip="The URL to fetch SAML configuration."
								type="text"
								name="samlURL"
								isRequired={true}
								value={providerConfigState.clients![0].additionalConfig?.samlURL || ""}
								handleChange={handleSamlInputChange}
								minLabelWidth={120}
							/>
						)}
					</>
				)}

				{samlInputType === "manual" && (
					<>
						<ThirdPartyProviderInput
							label="Client ID"
							tooltip="The client ID for the SAML provider."
							type="text"
							name="clientId"
							isRequired={true}
							value={providerConfigState.clients![0].clientId || ""}
							handleChange={(e) => {
								setProviderConfigState((prev) => ({
									...prev,
									clients: prev.clients!.map((client, index) =>
										index === 0 ? { ...client, clientId: e.target.value } : client
									),
								}));
							}}
							minLabelWidth={120}
						/>
						<ThirdPartyProviderInput
							label="Client Secret"
							tooltip="The client secret for the SAML provider."
							type="password"
							name="clientSecret"
							isRequired={true}
							value={providerConfigState.clients![0].clientSecret || ""}
							handleChange={(e) => {
								setProviderConfigState((prev) => ({
									...prev,
									clients: prev.clients!.map((client, index) =>
										index === 0 ? { ...client, clientSecret: e.target.value } : client
									),
								}));
							}}
							minLabelWidth={120}
						/>
						<ThirdPartyProviderInput
							label="Boxy URL"
							tooltip="The URL for the Boxy service."
							type="text"
							name="boxyURL"
							isRequired={true}
							value={providerConfigState.clients![0].additionalConfig?.boxyURL || ""}
							handleChange={(e) => {
								setProviderConfigState((prev) => ({
									...prev,
									clients: prev.clients!.map((client, index) =>
										index === 0
											? {
													...client,
													additionalConfig: {
														...client.additionalConfig,
														boxyURL: e.target.value,
													},
											  }
											: client
									),
								}));
							}}
							minLabelWidth={120}
						/>
					</>
				)}
			</div>
			<hr className="provider-config-divider" />
			<div
				className={`custom-provider-footer ${
					Object.keys(errorState).length > 0 ? "custom-provider-footer--error" : ""
				}`}>
				{Object.keys(errorState).length > 0 && (
					<div className="custom-provider-footer__form-error block-small block-error">
						<img
							className="custom-provider-footer__form-error-icon"
							src={getImageUrl("form-field-error-icon.svg")}
							alt="Error in field"
						/>
						<p className="text-small text-error">
							Please ensure all fields are correctly filled out before saving.
						</p>
					</div>
				)}

				<div className="custom-provider-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => {
							window.scrollTo(0, 0);
							handleGoBack();
						}}>
						Go Back
					</Button>
					<Button
						onClick={handleSave}
						isLoading={isSaving}
						disabled={isSaving}>
						Save
					</Button>
				</div>
			</div>
			{isDeleteProviderDialogOpen && (
				<DeleteThirdPartyProviderDialog
					onCloseDialog={() => setIsDeleteProviderDialogOpen(false)}
					thirdPartyId={providerId ?? ""}
					goBack={() => handleGoBack(true)}
				/>
			)}
		</PanelRoot>
	);
};

const getInitialProviderInfo = (providerConfig: ProviderConfig | undefined, providerId?: string): ProviderConfig => {
	if (providerConfig !== undefined) {
		return {
			thirdPartyId: providerConfig.thirdPartyId,
			name: providerConfig.name ?? "",
			clients: providerConfig.clients?.map((client) => ({
				clientId: client.clientId ?? "",
				clientSecret: client.clientSecret ?? "",
				additionalConfig: {
					...client.additionalConfig,
					samlXML: client.additionalConfig?.samlXML ?? "",
					samlURL: client.additionalConfig?.samlURL ?? "",
					samlInputType: client.additionalConfig?.samlInputType ?? "xml",
					redirectURLs: client.additionalConfig?.redirectURLs ?? [],
				},
			})) ?? [
				{
					clientId: "",
					clientSecret: "",
					additionalConfig: {
						samlXML: "",
						samlURL: "",
						samlInputType: "xml",
						redirectURLs: [],
					},
				},
			],
		};
	}

	return {
		thirdPartyId: SAML_PROVIDER_ID,
		name: "",
		clients: [
			{
				clientId: "",
				clientSecret: "",
				additionalConfig: {
					samlXML: "",
					samlURL: "",
					samlInputType: "xml",
					redirectURLs: [],
				},
			},
		],
	};
};

const RedirectURLs = ({
	redirectURLs,
	setRedirectURLs,
}: {
	redirectURLs: string[];
	setRedirectURLs: (redirectURLs: string[]) => void;
}) => {
	return (
		<div className="redirect-urls-container">
			<div className="redirect-urls-container__input-container">
				<ThirdPartyProviderInput
					label="Redirect URLs"
					tooltip="The redirect URLs for the SAML provider."
					type="text"
					name="redirect_urls"
					value={redirectURLs[0] ?? ""}
					handleChange={(e) => {
						const newRedirectURLs = [...redirectURLs];
						newRedirectURLs[0] = e.target.value;
						setRedirectURLs(newRedirectURLs);
					}}
					minLabelWidth={108}
				/>
				{(redirectURLs.length > 1 || redirectURLs[0]?.length > 0) && (
					<DeleteCrossButton
						onClick={() => {
							if (redirectURLs.length > 1) {
								setRedirectURLs(redirectURLs.filter((_, i) => i !== 0));
							} else {
								setRedirectURLs([""]);
							}
						}}
						label="Delete URL"
					/>
				)}
			</div>
			{redirectURLs?.slice(1).map((redirectURL, index) => (
				<div
					className="redirect-urls-container__input-container"
					key={index}>
					<ThirdPartyProviderInput
						label=""
						name={`redirect-url-${index}`}
						type="text"
						value={redirectURL}
						handleChange={(e) => {
							const newRedirectURLs = [...redirectURLs];
							newRedirectURLs[index + 1] = e.target.value;
							setRedirectURLs(newRedirectURLs);
						}}
						minLabelWidth={108}
					/>
					<DeleteCrossButton
						onClick={() => setRedirectURLs(redirectURLs.filter((_, i) => i !== index + 1))}
						label="Delete URL"
					/>
				</div>
			))}
			<div className="redirect-urls-container__footer">
				<hr className="redirect-urls-container__divider" />
				<button
					className="redirect-urls-container__add-new"
					onClick={() => setRedirectURLs([...redirectURLs, ""])}>
					+ Add new
				</button>
			</div>
		</div>
	);
};
