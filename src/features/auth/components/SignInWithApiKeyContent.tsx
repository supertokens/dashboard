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
import TextField from "@shared/components/text";
import { useApiKeyValidation } from "../hooks/useApiKeyValidation";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import styles from "./SignInWithApiKeyContent.module.scss";
import { withOverride } from "@plugins";

interface SignInWithApiKeyContentProps {
	onSuccess: () => void;
}

const SignInWithApiKeyContent = withOverride(
	"SignInWithApiKeyContent",
	function SignInWithApiKeyContent(props: SignInWithApiKeyContentProps) {
		const { onSuccess } = props;
		const { apiKey, apiKeyFieldError, loading, handleSubmit, handleApiKeyFieldChange } =
			useApiKeyValidation(onSuccess);

		return (
			<Flex
				direction="column"
				className={styles["api-key-form"]}>
				<Text className={styles["api-key-form__title"]}>Enter your API Key</Text>
				<Text
					size="2"
					className={styles["api-key-form__subtitle"]}>
					Please enter the API key that you used to connect with your backend
				</Text>
				<form
					className={styles["api-key-form__main"]}
					onSubmit={handleSubmit}>
					<Flex
						direction="column"
						gap="4">
						<TextField
							onChange={handleApiKeyFieldChange}
							name="apiKey"
							type="password"
							error={apiKeyFieldError}
							value={apiKey}
							size="2"
							placeholder="Your API Key"
						/>

						<Button
							mt="2"
							type="submit"
							disabled={loading}
							loading={loading}
							size="2"
							className={styles["api-key-form__button"]}>
							Continue
							<ArrowRightIcon />
						</Button>
					</Flex>
				</form>
			</Flex>
		);
	}
);

export default SignInWithApiKeyContent;
