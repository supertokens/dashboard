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

import React, { useState } from "react";
import { getImageUrl } from "@shared/utils";
import SafeAreaView from "@shared/components/safeAreaView/SafeAreaView";
import SignInContentWrapper from "./SignInContentWrapper";
import SignUpOrResetPassword from "./SignUpOrResetPasswordContent";
import { type ContentMode } from "./types";

import styles from "./Auth.module.scss";
import { assertNever } from "@shared/utils/assertNever";
import { withOverride } from "@plugins";

const INITIAL_CONTENT_TO_SHOW: ContentMode = "sign-in";

const Auth = withOverride("Auth", function Auth(props: { onSuccess: () => void }) {
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
				return assertNever(contentMode);
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
				className={`${styles["page-container"]} ${styles["auth-container"]}`}
				style={{ ...backgroundUrlVars }}>
				<div
					className={`${styles["auth-container__content"]} ${styles["block-container"]} ${
						styles["block-large"]
					} ${contentMode !== "sign-in" ? styles[`auth-container__content--${contentMode}`] : ""}`}>
					<img
						className={`${styles["title-image-smaller"]} ${styles["auth-container__logo"]}`}
						src={getImageUrl("ST_full_logo_light_theme.svg")}
						alt="Auth Page"
					/>
					{getContentToRender()}
				</div>
			</div>
		</>
	);
});

export default Auth;
