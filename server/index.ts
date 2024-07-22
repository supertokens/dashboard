/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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

import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import SuperTokens from "supertokens-node";
import { errorHandler, middleware } from "supertokens-node/framework/express";
import Dashboard from "supertokens-node/lib/build/recipe/dashboard/recipe";
import AccountLinking from "supertokens-node/recipe/accountlinking";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import EmailVerification from "supertokens-node/recipe/emailverification";
import Passwordless from "supertokens-node/recipe/passwordless";
import Session from "supertokens-node/recipe/session";
import ThirdParty from "supertokens-node/recipe/thirdparty";
import UserMetaData from "supertokens-node/recipe/usermetadata";
import UserRoles from "supertokens-node/recipe/userroles";

const websiteDomain = "http://localhost:3000";

let app = express();
app.use(morgan("[:date[iso]] :url :method :status :response-time ms - :res[content-length]"));

SuperTokens.init({
	framework: "express",
	supertokens: {
		connectionURI: "localhost:3567",
	},
	appInfo: {
		appName: "Dashboard Dev Node",
		apiDomain: "http://localhost:3001",
		websiteDomain,
		apiBasePath: "/auth",
	},
	recipeList: [
		Dashboard.init({
			apiKey: "test",
			// Keep this so that the dev server uses api key based login
			override: {
				functions: (original) => {
					return {
						...original,
						getDashboardBundleLocation: async function () {
							return "http://localhost:3000";
						},
					};
				},
			},
		}),
		UserMetaData.init(),
		// These are initialised so that functionailty works in the node SDK
		EmailPassword.init(),
		Passwordless.init({
			contactMethod: "EMAIL_OR_PHONE",
			flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
		}),
		ThirdParty.init({
			signInAndUpFeature: {
				providers: [
					{
						config: {
							thirdPartyId: "google",
							clients: [
								{
									clientId:
										"1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
									clientSecret: "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",
								},
							],
						},
					},
				],
			},
		}),
		EmailVerification.init({
			mode: "REQUIRED",
		}),
		Session.init(),
		AccountLinking.init(),
		UserRoles.init(),
	],
});

app.use(
	cors({
		origin: websiteDomain,
		allowedHeaders: ["content-type", ...SuperTokens.getAllCORSHeaders()],
		credentials: true,
	})
);

// @ts-ignore
app.use(middleware());

// @ts-ignore
app.use(errorHandler());

app.get("/status", (req, res) => {
	res.status(200).send("Started");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// Leaving this in because it helps with debugging
	console.log("Internal error", err);
	res.status(500).send(err.message === undefined ? "Internal server error" : err.message);
});

app.listen(3001, () => {
	console.log("Server started on port 3001");
});
