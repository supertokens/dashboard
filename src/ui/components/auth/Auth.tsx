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

import React, { useState } from "react";
import { getImageUrl } from "../../../utils";
import { Footer, LOGO_ICON_LIGHT } from "../footer/footer";
import SafeAreaView from "../safeAreaView/SafeAreaView";
import "./Auth.scss";
import SignInContentWrapper from "./SignInContentWrapper";
import SignUpOrResetPassword from "./SignUpOrResetPasswordContent";
import { type ContentMode } from "./types";

const INITIAL_CONTENT_TO_SHOW: ContentMode = "sign-in";

const Auth: React.FC<{
	onSuccess: () => void;
}> = (props) => {
	const [contentMode, setContentMode] = useState<ContentMode>(INITIAL_CONTENT_TO_SHOW);

	const getContentToRender = () => {
		switch (contentMode) {
			case "sign-in":
				return (
					<SignInContentWrapper
						onCreateNewUserClick={() => setContentMode("sign-up")}
						onForgotPasswordBtnClick={() => setContentMode("forgot-password")}
						onSuccess={props.onSuccess}
					/>
				);
			case "forgot-password":
			case "sign-up":
				return (
					<SignUpOrResetPassword
						onBack={() => setContentMode(INITIAL_CONTENT_TO_SHOW)}
						contentMode={contentMode}
					/>
				);
			default:
				return null;
		}
	};

	const backgroundUrlVars = {
		"--auth-background": `url("${getImageUrl("auth-background.png")}")`,
		"--auth-background-portrait": `url("${getImageUrl("auth-background-portrait.png")}")`,
	} as React.CSSProperties;

	return (
		<>
			<SafeAreaView backgroundColor="#EFEDEC" />
			<div
				className="page-container auth-container"
				style={backgroundUrlVars}>
				<div className={"block-container block-large " + contentMode}>
					<img
						className="title-image-smaller"
						src={LOGO_ICON_LIGHT}
						alt="Auth Page"
					/>
					{getContentToRender()}
				</div>
			</div>
			<Footer
				horizontalAlignment="center"
				size="normal"
				verticalAlignment="center"
				colorMode="dark"></Footer>
		</>
	);
};

export default Auth;
