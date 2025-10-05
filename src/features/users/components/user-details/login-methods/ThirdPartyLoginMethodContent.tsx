/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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

import { useState } from "react";

import { CheckCircledIcon, CopyIcon, CrossCircledIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Tooltip } from "@radix-ui/themes";

import Button from "@shared/components/button";
import CopyBox from "@shared/components/copyBox";
import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import Separator from "@shared/components/separator";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { LoginMethod } from "@features/users/types";

import styles from "./ThirdPartyLoginMethodContent.module.scss";
import { copyToClipboard } from "@shared/utils/copyToClipboard";

interface ThirdPartyLoginMethodContentProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
}

export default function ThirdPartyLoginMethodContent({ loginMethod, userId }: ThirdPartyLoginMethodContentProps) {
	const { showSuccessToast, showErrorToast } = useToast();
	const { sendVerificationEmail, toggleEmailVerification, getUserEmailVerificationStatus } = useLoginMethods(userId);

	const [isSendingEmail, setIsSendingEmail] = useState(false);

	const handleSendVerificationEmail = async () => {
		try {
			setIsSendingEmail(true);
			const status = await getUserEmailVerificationStatus(loginMethod.recipeUserId);

			if (status.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Email verification feature is not enabled");
				return;
			}

			const success = await sendVerificationEmail({
				recipeUserId: loginMethod.recipeUserId,
				tenantId: loginMethod.tenantIds[0],
			});

			if (success) {
				showSuccessToast("Verification email sent successfully");
			} else {
				showErrorToast("Failed to send verification email");
			}
		} catch (err) {
			showErrorToast("Failed to send verification email");
		} finally {
			setIsSendingEmail(false);
		}
	};

	const handleToggleVerification = async () => {
		try {
			const status = await getUserEmailVerificationStatus(loginMethod.recipeUserId);

			if (status.status === "FEATURE_NOT_ENABLED_ERROR") {
				showErrorToast("Email verification feature is not enabled");
				return;
			}

			const success = await toggleEmailVerification({
				recipeUserId: loginMethod.recipeUserId,
				isVerified: !loginMethod.verified,
				tenantId: loginMethod.tenantIds[0],
			});

			if (success) {
				showSuccessToast(`Email ${!loginMethod.verified ? "verified" : "unverified"} successfully`);
			} else {
				showErrorToast("Failed to update verification status");
			}
		} catch (err) {
			showErrorToast("Failed to update verification status");
		}
	};

	return (
		<Box
			p="4"
			className={styles["third-party-login-method-content"]}>
			{/* Email */}
			{loginMethod.email && (
				<>
					<Flex
						align="center"
						gap="2"
						mb="4">
						<ItemLabel className={styles["third-party-login-method-content__item-label"]}>Email:</ItemLabel>
						<ItemValue>{loginMethod.email}</ItemValue>
						{loginMethod.verified && (
							<Tooltip content="Verified email">
								<IconButton
									size="1"
									variant="soft"
									color="green"
									ml="2">
									<CheckCircledIcon />
								</IconButton>
							</Tooltip>
						)}
					</Flex>

					<Separator
						my="4"
						fullWidth
					/>
				</>
			)}

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
					<Flex
						gap="2"
						wrap="wrap">
						<Button
							size="2"
							variant="outline"
							color="gray"
							onClick={handleSendVerificationEmail}
							loading={isSendingEmail}
							disabled={loginMethod.verified}>
							<EnvelopeClosedIcon />
							Send Verification Mail
						</Button>
						<Button
							size="2"
							variant="outline"
							color={loginMethod.verified ? "gray" : "green"}
							onClick={handleToggleVerification}>
							{loginMethod.verified ? <CrossCircledIcon /> : <CheckCircledIcon />}
							{loginMethod.verified ? "Set Unverified" : "Set Verified"}
						</Button>
					</Flex>
				</>
			)}
		</Box>
	);
}
