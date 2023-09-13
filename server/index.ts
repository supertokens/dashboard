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
import RecipeUserId from "../../supertokens-node/lib/build/recipeUserId";

const websiteDomain = "http://localhost:3000";

let app = express();
app.use(morgan("[:date[iso]] :url :method :status :response-time ms - :res[content-length]"));

SuperTokens.init({
	framework: "express",
	supertokens: {
		connectionURI: "try.supertokens.com",
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
	],
});

app.use(
	cors({
		origin: websiteDomain,
		allowedHeaders: ["content-type", ...SuperTokens.getAllCORSHeaders()],
		credentials: true,
	})
);

app.use(middleware());

app.use(errorHandler());

app.get("/status", (req, res) => {
	res.status(200).send("Started");
});

app.get("/link", async (req, res) => {
	await AccountLinking.linkAccounts(
		"public",
		new RecipeUserId("6b763048-486f-4965-b2e0-2f7650efbdf5"),
		"6f922cbf-99de-4078-a9d0-e67dff5df09d"
	);
	await AccountLinking.linkAccounts(
		"public",
		new RecipeUserId("9a8837c0-ee02-457b-93bd-61bf16a6c2f9"),
		"6f922cbf-99de-4078-a9d0-e67dff5df09d"
	);
	await AccountLinking.linkAccounts(
		"public",
		new RecipeUserId("a31e669f-553a-40dc-9192-1b06c9d75d31"),
		"6f922cbf-99de-4078-a9d0-e67dff5df09d"
	);
	return res.status(200).send("OK");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// Leaving this in because it helps with debugging
	console.log("Internal error", err);
	res.status(500).send(err.message === undefined ? "Internal server error" : err.message);
});

app.listen(3001, () => {
	console.log("Server started on port 3001");
});
