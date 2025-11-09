/* Copyright (c) 2025, VRAI Labs and/or its affiliates. All rights reserved.
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

import { Theme } from "@radix-ui/themes";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { getDashboardAppBasePath } from "@shared/utils";

// This is to make sure that images are packed in the build folder
import "./images";

import TenantManagement from "@features/tenants/Page";
import { UserManagement } from "@features/users/page";
import { ToastProvider } from "@shared/components/toast";
import { QueryProvider } from "@shared/providers/QueryProvider";
import { ROUTES } from "@shared/navigation";
import RolesAndPermissions from "@features/roles-and-permissions/Page";
import { Layout } from "@features/layout";
import AuthWrapper from "@features/auth/components/AuthWrapper";
import SafeAreaView from "@shared/components/safeAreaView/SafeAreaView";
import ErrorBoundary from "@shared/components/errorboundary";
import { AccessDeniedModal } from "@shared/components/accessDenied";
import React, { useMemo } from "react";
import { SuperTokens } from "./supertokens";
import { Implementation } from "./implementation";
import { ComponentOverrideContext } from "@plugins";

function App() {
	// todo remove this - example only
	Implementation.getInstanceOrThrow().testMethod();

	const pluginRoutes = useMemo(() => {
		return SuperTokens.getInstanceOrThrow().pluginRouteHandlers.map(({ path, handler: RouteComponent }, index) => (
			<Route
				key={index}
				path={path}
				element={<RouteComponent />}
			/>
		));
	}, []);

	return (
		<HelmetProvider>
			<ComponentOverrideContext.Provider value={SuperTokens.getInstanceOrThrow().overridableComponents}>
				<SafeAreaView />
				<ErrorBoundary>
					<Theme
						radius="medium"
						accentColor="indigo"
						appearance="light">
						<QueryProvider>
							<ToastProvider>
								<AuthWrapper>
									<Router basename={getDashboardAppBasePath()}>
										<Layout>
											<Routes>
												<Route
													path={ROUTES.USERS}
													element={<UserManagement />}
												/>
												<Route
													path={ROUTES.ROLES}
													element={<RolesAndPermissions />}
												/>
												<Route
													path={ROUTES.TENANTS}
													element={<TenantManagement />}
												/>

											{pluginRoutes}

											<Route
												path="*"
												element={<UserManagement />}
											/>
										</Routes>
									</Layout>
								</Router>
								<AccessDeniedModal />
							</AuthWrapper>
						</ToastProvider>
					</QueryProvider>
				</Theme>
			</ErrorBoundary>
		</HelmetProvider>
	);
}

export default App;
