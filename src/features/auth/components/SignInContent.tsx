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
import { Button, Flex, Text } from "@radix-ui/themes";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import TextField from "@shared/components/text";
import { useSignIn } from "../hooks/useSignIn";
import styles from "./SignInContent.module.scss";

interface SignInContentProps {
	onSuccess: () => void;
	onCreateNewUserClick: () => void;
	onForgotPasswordBtnClick: () => void;
}

const SignInContent: React.FC<SignInContentProps> = ({
	onSuccess,
	onCreateNewUserClick,
	onForgotPasswordBtnClick,
}): JSX.Element => {
	const {
		isLoading,
		userTriedToSubmit,
		email,
		password,
		errors,
		serverValidationError,
		handleSubmit,
		handleEmailFieldChange,
		handlePasswordFieldChange,
	} = useSignIn(onSuccess);

	return (
		<Flex
			direction="column"
			className={styles["sign-in-form"]}>
			<Text className={styles["sign-in-form__title"]}>User Management Dashboard</Text>
			<Text
				size="2"
				className={styles["sign-in-form__subtitle"]}>
				Not registered yet?{" "}
				<span
					role="button"
					onClick={onCreateNewUserClick}
					className={styles["sign-in-form__link"]}>
					Add a new user
				</span>
			</Text>

			{serverValidationError && <div className={styles["sign-in-form__error"]}>{serverValidationError}</div>}

			<hr className={styles["sign-in-form__divider"]} />

			<form
				noValidate
				className={styles["sign-in-form__main"]}
				onSubmit={handleSubmit}>
				<Flex
					direction="column"
					gap="4">
					<div className={styles["sign-in-form__field-group"]}>
						<label className={styles["sign-in-form__label"]}>Email</label>
						<TextField
							onChange={handleEmailFieldChange}
							name="email"
							type="email"
							error={userTriedToSubmit || !!email ? errors.email : ""}
							value={email}
							size="2"
							placeholder="Enter your email"
						/>
					</div>

					<div className={styles["sign-in-form__field-group"]}>
						<label className={styles["sign-in-form__label"]}>Password</label>
						<TextField
							onChange={handlePasswordFieldChange}
							name="password"
							type="password"
							error={userTriedToSubmit || !!password ? errors.password : ""}
							value={password}
							size="2"
							placeholder="Enter your password"
						/>
					</div>

					<Flex
						className={styles["sign-in-form__cta-container"]}
						justify="between"
						align="center"
						mt="4">
						<Button
							type="submit"
							disabled={isLoading}
							loading={isLoading}
							size="2"
							className={styles["sign-in-form__sign-in-button"]}>
							Sign In
							<ArrowRightIcon />
						</Button>

						<Button
							variant="ghost"
							disabled={isLoading}
							onClick={onForgotPasswordBtnClick}
							type="button"
							size="2"
							className={styles["sign-in-form__forgot-button"]}>
							Forgot Password?
						</Button>
					</Flex>
				</Flex>
			</form>
		</Flex>
	);
};

export default SignInContent;
