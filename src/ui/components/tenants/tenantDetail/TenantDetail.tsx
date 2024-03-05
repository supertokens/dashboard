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
import { useEffect, useState } from "react";
import { useCoreConfigService, useTenantService, useThirdPartyService } from "../../../../api/tenants";
import { CoreConfigOptions, ProviderConfig, TenantDashboardView, TenantInfo } from "../../../../api/tenants/types";
import { ReactComponent as NoTenantFound } from "../../../../assets/no-tenants.svg";
import { PUBLIC_TENANT_ID } from "../../../../constants";
import { getImageUrl } from "../../../../utils";
import Button from "../../button";
import { Loader, LoaderOverlay } from "../../loader/Loader";
import { CoreConfigSection } from "./CoreConfigSection";
import { DeleteTenantDialog } from "./deleteTenant/DeleteTenant";
import { LoginMethodsSection } from "./LoginMethodsSection";
import "./tenantDetail.scss";
import { TenantDetailContextProvider } from "./TenantDetailContext";
import { TenantDetailHeader } from "./TenantDetailHeader";
import { ThirdPartyPage } from "./thirdPartyPage/ThirdPartyPage";
import { ThirdPartySection } from "./ThirdPartySection";

export const TenantDetail = ({
	onBackButtonClicked,
	tenantId,
}: {
	onBackButtonClicked: () => void;
	tenantId: string;
}) => {
	const { getTenantInfo } = useTenantService();
	const { getCoreConfigOptions } = useCoreConfigService();
	const { getThirdPartyProviders } = useThirdPartyService();
	const [tenant, setTenant] = useState<TenantInfo | undefined>(undefined);
	const [configOptions, setConfigOptions] = useState<CoreConfigOptions>([]);
	const [resolvedProviders, setResolvedProviders] = useState<Array<ProviderConfig>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleteTenantDialogOpen, setIsDeleteTenantDialogOpen] = useState(false);
	const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
	const [viewObj, setViewObj] = useState<TenantDashboardView>({
		view: "tenant-detail",
	});

	const tenantHasThirdPartyEnabled = tenant?.thirdParty.enabled;

	const getTenant = async () => {
		const response = await getTenantInfo(tenantId);
		if (response?.status === "OK") {
			setTenant(response.tenant);
		}
	};

	const getCoreConfig = async () => {
		const response = await getCoreConfigOptions();
		if (response?.status === "OK") {
			setConfigOptions(response.config);
		}
	};

	const getThirdPartyProvidersInfo = async () => {
		const repsonse = await getThirdPartyProviders(tenantId);
		if (repsonse?.status === "OK") {
			setResolvedProviders(repsonse.providers);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);
				await getTenant();
				await getCoreConfig();
				await getThirdPartyProvidersInfo();
			} catch (_) {
			} finally {
				setIsLoading(false);
			}
		};
		void fetchData();
	}, [tenantId]);

	const refetchTenant = async () => {
		setShowLoadingOverlay(true);
		await getTenant();
		await getThirdPartyProvidersInfo();
		setShowLoadingOverlay(false);
	};

	const handleAddNewProvider = () => {
		window.scrollTo(0, 0);
		setViewObj({
			view: "list-third-party-providers",
		});
	};

	const handleEditProvider = (providerId: string) => {
		window.scrollTo(0, 0);
		setViewObj({
			view: "add-or-edit-third-party-provider",
			thirdPartyId: providerId,
			isAddingNewProvider: false,
		});
	};

	const handleBackToTenantDetail = () => {
		window.scrollTo(0, 0);
		setViewObj({
			view: "tenant-detail",
		});
	};

	const renderView = () => {
		if (viewObj.view === "list-third-party-providers" || viewObj.view === "add-or-edit-third-party-provider") {
			return (
				<ThirdPartyPage
					handleGoBack={handleBackToTenantDetail}
					viewObj={viewObj}
					setViewObj={setViewObj}
				/>
			);
		}

		return (
			<div className="tenant-detail">
				{showLoadingOverlay && <LoaderOverlay />}
				<button
					className="button flat"
					onClick={onBackButtonClicked}>
					<img
						src={getImageUrl("left-arrow-dark.svg")}
						alt="Go back"
					/>
					<span>Back to all tenants</span>
				</button>
				<div className="tenant-detail__sections">
					<TenantDetailHeader />
					<LoginMethodsSection />
					{tenantHasThirdPartyEnabled && (
						<ThirdPartySection
							handleAddNewProvider={handleAddNewProvider}
							handleEditProvider={handleEditProvider}
						/>
					)}
					{tenant?.tenantId !== PUBLIC_TENANT_ID && <CoreConfigSection />}
				</div>
				{tenant?.tenantId !== PUBLIC_TENANT_ID && (
					<div className="tenant-detail__delete-container">
						<Button
							color="danger"
							onClick={() => setIsDeleteTenantDialogOpen(true)}>
							Delete Tenant
						</Button>
					</div>
				)}
				{isDeleteTenantDialogOpen && (
					<DeleteTenantDialog
						onCloseDialog={() => setIsDeleteTenantDialogOpen(false)}
						tenantId={tenant!.tenantId}
						goBack={onBackButtonClicked}
					/>
				)}
			</div>
		);
	};

	if (isLoading) {
		return <Loader />;
	}

	if (tenant === undefined && !isLoading) {
		return (
			<div className="tenant-not-found">
				<NoTenantFound />
				<h1>Cannot find a tenant for the given tenant id</h1>
				<button onClick={onBackButtonClicked}>Back to all tenants</button>
			</div>
		);
	}

	if (!tenant) {
		throw new Error("This should be unreachable");
	}

	return (
		<TenantDetailContextProvider
			tenantInfo={tenant}
			setTenantInfo={setTenant}
			coreConfigOptions={configOptions}
			refetchTenant={refetchTenant}
			resolvedProviders={resolvedProviders}>
			{renderView()}
		</TenantDetailContextProvider>
	);
};
