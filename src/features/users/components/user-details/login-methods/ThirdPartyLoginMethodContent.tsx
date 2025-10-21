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

import { CopyIcon } from "@radix-ui/react-icons";
import { Box, Flex } from "@radix-ui/themes";

import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import Separator from "@shared/components/separator";
import { useToast } from "@shared/components/toast";
import { copyToClipboard } from "@shared/utils/copyToClipboard";

import { LoginMethod } from "@features/users/types";

import EmailField from "./EmailField";
import EmailVerificationActions from "./EmailVerificationActions";
import { useEmailVerification } from "./useEmailVerification";
import styles from "./ThirdPartyLoginMethodContent.module.scss";

interface ThirdPartyLoginMethodContentProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
}

export default function ThirdPartyLoginMethodContent({ loginMethod, userId }: ThirdPartyLoginMethodContentProps) {
	const { showSuccessToast, showErrorToast } = useToast();
	const { isSendingEmail, handleSendVerificationEmail, handleToggleVerification } = useEmailVerification({
		userId,
		recipeUserId: loginMethod.recipeUserId,
		tenantId: loginMethod.tenantIds[0],
		isVerified: loginMethod.verified,
	});

	return (
		<Box
			p="4"
			className={styles["third-party-login-method-content"]}>
			{/* Email */}
			{loginMethod.email && (
				<>
					<EmailField
						email={loginMethod.email}
						isVerified={loginMethod.verified}
						className={styles["third-party-login-method-content__item-label"]}
					/>
				</>
			)}
			{loginMethod.email && loginMethod.thirdParty?.userId ? (
				<Separator
					my="4"
					fullWidth
				/>
			) : null}

			{/* Provider Info */}
			{loginMethod.thirdParty?.userId && (
				<Flex
					align="center"
					gap="2"
					mb="4">
					<ItemLabel className={styles["third-party-login-method-content__item-label"]}>
						Provider ID:
					</ItemLabel>
					<ItemValue>{loginMethod.thirdParty.userId}</ItemValue>
					<CopyIcon
						onClick={() =>
							copyToClipboard(
								loginMethod.thirdParty?.userId || "",
								() => showSuccessToast("Provider ID copied to clipboard"),
								() => showErrorToast("Failed to copy provider ID to clipboard")
							)
						}
					/>
				</Flex>
			)}

			{/* Actions */}
			{loginMethod.email && (
				<>
					<Separator
						my="4"
						fullWidth
					/>
					<EmailVerificationActions
						isVerified={loginMethod.verified}
						isSendingEmail={isSendingEmail}
						onSendVerificationEmail={handleSendVerificationEmail}
						onToggleVerification={handleToggleVerification}
					/>
				</>
			)}
		</Box>
	);
}
