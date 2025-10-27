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

import { getAuthMode } from "@shared/utils";
import SignIn from "./SignInContent";
import SignInWithApiKeyContent from "./SignInWithApiKeyContent";
import { withOverride } from "@plugins";

interface SignInContentWrapperProps {
	onSuccess: () => void;
	onCreateNewUserClick: () => void;
	onForgotPasswordBtnClick: () => void;
}

const SignInContentWrapper = withOverride(
	"SignInContentWrapper",
	function SignInContentWrapper(props: SignInContentWrapperProps) {
		const authMode = getAuthMode();

		if (authMode === "email-password") {
			return <SignIn {...props} />;
		}

		return <SignInWithApiKeyContent onSuccess={props.onSuccess} />;
	}
);

export default SignInContentWrapper;
