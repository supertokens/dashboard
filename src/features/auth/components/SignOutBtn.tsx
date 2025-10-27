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

import useAuthService from "@api";

import styles from "./SignOutBtn.module.scss";
import Loader from "@shared/components/loader";
import { withOverride } from "@plugins";

const SignOutBtn = withOverride("SignOutBtn", function SignOutBtn() {
	const { logout, isLoading } = useAuthService();

	return (
		<>
			<button
				onClick={logout}
				className={styles["sign-out-btn"]}
				disabled={isLoading}>
				{isLoading ? "Logging out..." : "Logout"}
			</button>
			{isLoading && <Loader type="page" />}
		</>
	);
});

export default SignOutBtn;
