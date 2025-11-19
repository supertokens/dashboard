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

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "./shared/styles";
import { SuperTokens } from "./supertokens";

SuperTokens.init({
	appInfo: {
		apiDomain: new URL((window as any).dashboardAppPath).origin,
		connectionURI: (window as any).connectionURI,
		apiBasePath: "/auth",
		staticBasePath: (window as any).staticBasePath,
		dashboardBasePath: new URL((window as any).dashboardAppPath).pathname,
	},
	authMode: (window as any).authMode,
	isSearchEnabled: (window as any).isSearchEnabled === "true",
	plugins: [
		{
			id: "test",
			version: "1.0.0",
			overrides: {
				components: (originalComponentOverrides) => {
					return {
						...originalComponentOverrides,
						Layout_Override: ({ DefaultComponent, ...props }) => {
							return (
								<>
									{originalComponentOverrides.Layout_Override && (
										<originalComponentOverrides.Layout_Override
											DefaultComponent={DefaultComponent}
											{...props}
										/>
									)}
									<div>Plugin override</div>
								</>
							);
						},
					};
				},
			},
		},
	],
	override: {
		components: (originalComponentOverrides) => {
			return {
				...originalComponentOverrides,
				Layout_Override: ({ DefaultComponent, ...props }) => {
					return (
						<>
							<DefaultComponent {...props} /> <div>Config override</div>
						</>
					);
				},
			};
		},
	},
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
void reportWebVitals();
