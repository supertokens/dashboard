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
import { useTenantService } from "../../../../api/tenants";
import { TenantInfo } from "../../../../api/tenants/types";
import { ReactComponent as NoTenantFound } from "../../../../assets/no-tenants.svg";
import { getImageUrl } from "../../../../utils";
import { Loader } from "../../loader/Loader";
import { CoreConfigSection } from "./CoreConfigSection";
import { LoginMethodsSection, SecondaryFactors } from "./LoginMethodsSection";
import { TenantDetailContextProvider } from "./TenantDetailContext";
import { TenantDetailHeader } from "./TenantDetailHeader";
import "./tenantDetail.scss";

export const TenantDetail = ({
	onBackButtonClicked,
	tenantId,
}: {
	onBackButtonClicked: () => void;
	tenantId: string;
}) => {
	const { getTenantInfo } = useTenantService();
	const [tenant, setTenant] = useState<TenantInfo | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const getTenant = async () => {
			try {
				setIsLoading(true);
				const response = await getTenantInfo(tenantId);
				if (response?.status === "OK") {
					setTenant(response.tenant);
				}
			} catch (_) {
			} finally {
				setIsLoading(false);
			}
		};
		void getTenant();
	}, [tenantId]);

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

	return (
		<TenantDetailContextProvider tenantInfo={tenant!}>
			<div className="tenant-detail">
				<button
					className="button flat"
					onClick={onBackButtonClicked}>
					<img
						src={getImageUrl("left-arrow-dark.svg")}
						alt="Go back"
					/>
					<span>Back to all tenants</span>
				</button>
				<div className="sections">
					<TenantDetailHeader />
					<LoginMethodsSection />
					<SecondaryFactors />
					<CoreConfigSection />
				</div>
			</div>
		</TenantDetailContextProvider>
	);
};
