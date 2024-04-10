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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useGetThirdPartyProviderInfo } from "../../../../../api/tenants";
import { ProviderConfigResponse, TenantDashboardView } from "../../../../../api/tenants/types";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "../../../../../constants";
import { getImageUrl, isValidHttpUrl } from "../../../../../utils";
import Button from "../../../button";
import { Loader } from "../../../loader/Loader";
import { useTenantDetailContext } from "../TenantDetailContext";
import { TenantDetailHeader } from "../TenantDetailHeader";
import { PanelHeader, PanelHeaderTitleWithTooltip, PanelRoot } from "../tenantDetailPanel/TenantDetailPanel";
import { ThirdPartyProviderButton } from "../thirdPartyProviderButton/ThirdPartyProviderButton";
import { ProviderInfoForm } from "../thirdPartyProviderConfig/ProviderInfoForm";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import "./thirdPartyPage.scss";

export const ThirdPartyPage = ({
	viewObj,
	setViewObj,
}: {
	viewObj: TenantDashboardView;
	setViewObj: Dispatch<SetStateAction<TenantDashboardView>>;
}) => {
	const handleProviderInfoBack = () => {
		setViewObj({ view: "tenant-detail" });
	};
	return (
		<div className="third-party-section">
			<button
				className="button flat"
				onClick={() => handleProviderInfoBack()}>
				<img
					src={getImageUrl("left-arrow-dark.svg")}
					alt="Go back"
				/>
				<span>Back to tenant info</span>
			</button>
			<div className="third-party-section__cards">
				<TenantDetailHeader onlyShowTenantId />
				{viewObj.view === "add-or-edit-third-party-provider" && (
					<ProviderInfo
						providerId={viewObj.thirdPartyId}
						isAddingNewProvider={viewObj.isAddingNewProvider}
						handleGoBack={handleProviderInfoBack}
					/>
				)}
			</div>
		</div>
	);
};

const ProviderInfo = ({
	providerId,
	isAddingNewProvider,
	handleGoBack,
}: {
	providerId?: string;
	isAddingNewProvider: boolean;
	handleGoBack: (shouldGoBackToDetailPage?: boolean) => void;
}) => {
	const { tenantInfo } = useTenantDetailContext();
	const [isProviderInfoLoading, setIsProviderInfoLoading] = useState(true);
	const [hasFilledCustomFieldsForProvider, setHasFilledCustomFieldsForProvider] = useState(
		!PROVIDERS_WITH_ADDITIONAL_CONFIG.includes(providerId ?? "")
	);
	const getThirdPartyProviderInfo = useGetThirdPartyProviderInfo();
	const [providerConfigResponse, setProviderConfigResponse] = useState<ProviderConfigResponse | undefined>(undefined);
	const providerHasCustomFields =
		typeof providerId === "string" && PROVIDERS_WITH_ADDITIONAL_CONFIG.includes(providerId);

	const fetchProviderInfo = async (id: string, additionalConfig?: Record<string, string>) => {
		setHasFilledCustomFieldsForProvider(true);
		try {
			setIsProviderInfoLoading(true);
			const response = await getThirdPartyProviderInfo(tenantInfo.tenantId, id, additionalConfig);
			if (response.status === "OK") {
				setProviderConfigResponse(response.providerConfig);
			}
		} catch (error) {
		} finally {
			setIsProviderInfoLoading(false);
		}
	};

	useEffect(() => {
		if (typeof providerId === "string" && !(isAddingNewProvider && providerHasCustomFields)) {
			void fetchProviderInfo(providerId);
		}
	}, [providerId]);

	if (
		providerHasCustomFields &&
		!hasFilledCustomFieldsForProvider &&
		isAddingNewProvider &&
		typeof providerId === "string"
	) {
		return (
			<ProviderAdditionalConfigForm
				providerId={providerId}
				fetchProviderInfo={fetchProviderInfo}
				handleGoBack={handleGoBack}
			/>
		);
	}

	if (isProviderInfoLoading && typeof providerId === "string") {
		return <Loader />;
	}

	if (!isProviderInfoLoading && !providerConfigResponse && typeof providerId === "string") {
		throw new Error("Provider config not found");
	}

	return (
		<ProviderInfoForm
			providerId={providerId}
			providerConfig={providerConfigResponse}
			handleGoBack={handleGoBack}
			isAddingNewProvider={isAddingNewProvider}
		/>
	);
};

const ThirdPartyProvidersList = ({ setViewObj }: { setViewObj: Dispatch<SetStateAction<TenantDashboardView>> }) => {
	const handleAddNewInBuiltProvider = (providerId: string) => {
		window.scrollTo(0, 0);
		setViewObj({
			view: "add-or-edit-third-party-provider",
			thirdPartyId: providerId,
			isAddingNewProvider: true,
		});
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<PanelHeaderTitleWithTooltip>Add new Social / Enterprise Login Provider</PanelHeaderTitleWithTooltip>
			</PanelHeader>
			<div className="provider-list-header">
				Select the Provider that you want to add for you tenant from the list below
			</div>
			<div className="provider-list-container">
				<h2 className="provider-list-container__header-with-divider">Enterprise Providers</h2>
				<div className="provider-list-container__providers-grid">
					{IN_BUILT_THIRD_PARTY_PROVIDERS.filter((provider) => provider.isEnterprise).map((provider) => {
						return (
							<ThirdPartyProviderButton
								key={provider.id}
								title={provider.label}
								icon={provider.icon}
								onClick={() => handleAddNewInBuiltProvider(provider.id)}
							/>
						);
					})}
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					Social Providers
				</h2>
				<div className="provider-list-container__providers-grid">
					{IN_BUILT_THIRD_PARTY_PROVIDERS.filter((provider) => !provider.isEnterprise).map((provider) => {
						return (
							<ThirdPartyProviderButton
								key={provider.id}
								title={provider.label}
								icon={provider.icon}
								onClick={() => handleAddNewInBuiltProvider(provider.id)}
							/>
						);
					})}
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					Custom OAuth Providers
				</h2>
				<div className="provider-list-container__providers-grid">
					<ThirdPartyProviderButton
						title="Add Custom Provider"
						type="without-icon"
						onClick={() => {
							window.scrollTo(0, 0);
							setViewObj({
								view: "add-or-edit-third-party-provider",
								isAddingNewProvider: true,
							});
						}}
					/>
				</div>
				<h2 className="provider-list-container__header-with-divider provider-list-container__header-with-divider--margin-top-30">
					SAML
				</h2>
				<div className="provider-list-container__providers-grid">
					<ThirdPartyProviderButton
						title="Add SAML Provider"
						type="without-icon"
						onClick={() => handleAddNewInBuiltProvider(SAML_PROVIDER_ID)}
					/>
				</div>
			</div>
		</PanelRoot>
	);
};

const ProviderAdditionalConfigForm = ({
	providerId,
	fetchProviderInfo,
	handleGoBack,
}: {
	providerId: string;
	fetchProviderInfo: (providerId: string, additionalConfig?: Record<string, string>) => void;
	handleGoBack: () => void;
}) => {
	const handleContinue = (additionalConfig: Record<string, string>) => {
		fetchProviderInfo(providerId, additionalConfig);
	};

	const renderForm = () => {
		switch (providerId) {
			case "google-workspaces":
				return (
					<GoogleWorkspacesForm
						handleContinue={handleContinue}
						handleGoBack={handleGoBack}
					/>
				);
			case "active-directory":
				return (
					<ActiveDirectoryForm
						handleContinue={handleContinue}
						handleGoBack={handleGoBack}
					/>
				);
			case "okta":
				return (
					<OktaForm
						handleContinue={handleContinue}
						handleGoBack={handleGoBack}
					/>
				);
			case "boxy-saml":
				return (
					<BoxySamlForm
						handleContinue={handleContinue}
						handleGoBack={handleGoBack}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<PanelRoot>
			<PanelHeader>
				<div className="built-in-provider-config-header">
					<div className="built-in-provider-config-header__title">
						<PanelHeaderTitleWithTooltip>Provider Configuration</PanelHeaderTitleWithTooltip>
					</div>
				</div>
			</PanelHeader>
			{renderForm()}
		</PanelRoot>
	);
};

type AdditionalConfigFormProps = {
	handleContinue: (additionalConfig: Record<string, string>) => void;
	handleGoBack: () => void;
};

const BoxySamlForm = ({ handleContinue, handleGoBack }: AdditionalConfigFormProps) => {
	const [boxyUrl, setBoxyUrl] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onContinue = () => {
		if (!isValidHttpUrl(boxyUrl)) {
			setError("Please enter a valid URL");
			return;
		}
		handleContinue({ boxyUrl });
	};

	return (
		<div className="saml-intro-container">
			<p className="saml-intro-container__header">
				You will need to setup <b>BoxyHQ</b> to add the SAML client.
			</p>

			<SAMLInfoBox title="Managed Service">
				<a href="mailto:team@supertokens.com">Email us</a> to receive your Boxy URL and continue setup of your
				SAML client.
			</SAMLInfoBox>

			<SAMLInfoBox title="Self Hosted">
				Follow the steps in the{" "}
				<a
					href="https://boxyhq.com/docs/jackson/deploy"
					rel="noreferrer noopener"
					target="_blank">
					BoxyHQ docs
				</a>{" "}
				to get your Boxy URL and continue setup of your SAML client.
			</SAMLInfoBox>

			<p className="saml-intro-container__boxy-url-header">Add the Boxy URL below</p>

			<div className="additional-config-field">
				<ThirdPartyProviderInput
					label="Boxy URL"
					type="text"
					name="boxyURL"
					value={boxyUrl}
					forceShowError
					error={error ?? undefined}
					handleChange={(e) => {
						setBoxyUrl(e.target.value);
						setError(null);
					}}
				/>
			</div>

			<hr className="provider-config-divider" />
			<div className="additional-config-footer">
				<div />
				<div className="additional-config-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => handleGoBack()}>
						Go Back
					</Button>
					<Button onClick={onContinue}>Continue</Button>
				</div>
			</div>
		</div>
	);
};

const ActiveDirectoryForm = ({ handleContinue, handleGoBack }: AdditionalConfigFormProps) => {
	const [directoryId, setDirectoryId] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onContinue = () => {
		if (directoryId.trim().length === 0) {
			setError("Please enter a valid directory ID to continue");
			return;
		}
		handleContinue({ directoryId });
	};

	return (
		<div className="additional-config-container">
			<p className="additional-config-container__header">
				Add Active Directory Id you want the end users to authenticate against.
			</p>

			<div className="additional-config-field">
				<ThirdPartyProviderInput
					label="Directory ID"
					type="text"
					name="directoryId"
					value={directoryId}
					forceShowError
					error={error ?? undefined}
					handleChange={(e) => {
						setDirectoryId(e.target.value);
						setError(null);
					}}
				/>
			</div>

			<hr className="provider-config-divider" />
			<div className="additional-config-footer">
				<div />
				<div className="additional-config-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => handleGoBack()}>
						Go Back
					</Button>
					<Button onClick={onContinue}>Continue</Button>
				</div>
			</div>
		</div>
	);
};

const OktaForm = ({ handleContinue, handleGoBack }: AdditionalConfigFormProps) => {
	const [oktaDomain, setOktaDomain] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onContinue = () => {
		if (!isValidHttpUrl(oktaDomain)) {
			setError("Please enter a valid URL.");
			return;
		}
		handleContinue({ oktaDomain });
	};

	return (
		<div className="additional-config-container">
			<p className="additional-config-container__header">Add base URL of your Okta Authorization server</p>

			<div className="additional-config-field">
				<ThirdPartyProviderInput
					label="Okta Domain"
					type="text"
					name="oktaDomain"
					value={oktaDomain}
					forceShowError
					error={error ?? undefined}
					handleChange={(e) => {
						setOktaDomain(e.target.value);
						setError(null);
					}}
				/>
			</div>

			<hr className="provider-config-divider" />
			<div className="additional-config-footer">
				<div />
				<div className="additional-config-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => handleGoBack()}>
						Go Back
					</Button>
					<Button onClick={onContinue}>Continue</Button>
				</div>
			</div>
		</div>
	);
};

const GoogleWorkspacesForm = ({ handleContinue, handleGoBack }: AdditionalConfigFormProps) => {
	const [hd, setHd] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onContinue = () => {
		if (hd.trim().length === 0) {
			setError("Please enter a valid hosted domain to continue.");
			return;
		}
		handleContinue({ hd });
	};

	return (
		<div className="additional-config-container">
			<p className="additional-config-container__header">
				Add domain you want to allow google workspace login for.
			</p>

			<div className="additional-config-field">
				<ThirdPartyProviderInput
					label="Hosted Domain"
					type="text"
					name="directoryId"
					value={hd}
					forceShowError
					error={error ?? undefined}
					handleChange={(e) => {
						setHd(e.target.value);
						setError(null);
					}}
				/>
			</div>

			<p className="additional-config-container__note">
				Enter “ * “ if you want to allow logins for any google workspace domain.
			</p>

			<hr className="provider-config-divider" />
			<div className="additional-config-footer">
				<div />
				<div className="additional-config-footer__primary-ctas">
					<Button
						color="gray-outline"
						onClick={() => handleGoBack()}>
						Go Back
					</Button>
					<Button onClick={onContinue}>Continue</Button>
				</div>
			</div>
		</div>
	);
};

const SAMLInfoBox = ({ title, children }: { title: string; children: React.ReactNode }) => {
	return (
		<div className="saml-info-box-container">
			<div className="saml-info-box-container__title-container">
				<h2 className="saml-info-box-container__title">{title}</h2>
			</div>
			<div className="saml-info-box-container__content">{children}</div>
		</div>
	);
};

const PROVIDERS_WITH_ADDITIONAL_CONFIG = ["google-workspaces", "active-directory", "okta", "boxy-saml"];