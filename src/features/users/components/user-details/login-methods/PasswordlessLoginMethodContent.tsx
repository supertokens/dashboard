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

import { CheckCircledIcon, CrossCircledIcon, EnvelopeClosedIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Box, Flex, IconButton, Tooltip } from "@radix-ui/themes";

import Button from "@shared/components/button";
import CopyBox from "@shared/components/copyBox";
import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import Separator from "@shared/components/separator";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { LoginMethod } from "@features/users/types";

import styles from "./PasswordlessLoginMethodContent.module.scss";

interface PasswordlessLoginMethodContentProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
	readonly onEditClick: () => void;
}

export default function PasswordlessLoginMethodContent({
	loginMethod,
	userId,
	onEditClick,
}: PasswordlessLoginMethodContentProps) {
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
			className={styles["passwordless-login-method-content"]}>
			{/* Email */}
			{loginMethod.email && (
				<>
					<Flex
						align="center"
						gap="2"
						mb="4">
						<ItemLabel className={styles["passwordless-login-method-content__item-label"]}>
							Email:
						</ItemLabel>
						<ItemValue>{loginMethod.email}</ItemValue>
						<Pencil1Icon
							onClick={onEditClick}
							style={{ cursor: "pointer" }}
						/>
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
				</>
			)}

			{/* Phone Number */}
			{loginMethod.phoneNumber && (
				<>
					<Separator
						my="4"
						fullWidth
					/>
					<Flex
						align="center"
						gap="2"
						mb="4">
						<ItemLabel className={styles["passwordless-login-method-content__item-label"]}>
							Phone Number:
						</ItemLabel>
						{loginMethod.phoneNumber ? (
							<ItemValue>{loginMethod.phoneNumber}</ItemValue>
						) : (
							<ItemValue>-</ItemValue>
						)}
						<Pencil1Icon
							onClick={onEditClick}
							style={{ cursor: "pointer" }}
						/>
					</Flex>
				</>
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
