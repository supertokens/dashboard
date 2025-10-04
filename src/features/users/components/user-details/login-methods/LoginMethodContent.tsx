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
import { Box, Flex } from "@radix-ui/themes";

import Button from "@shared/components/button";
import CopyBox from "@shared/components/copyBox";
import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import Separator from "@shared/components/separator";
import { useToast } from "@shared/components/toast";

import { useLoginMethods } from "@features/users/hooks/useLoginMethods";
import { LoginMethod } from "@features/users/types";
import { ChangePasswordModal } from "../modals";

import styles from "./LoginMethodContent.module.scss";

interface LoginMethodContentProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
	readonly onEditClick: () => void;
}

export default function LoginMethodContent({ loginMethod, userId, onEditClick }: LoginMethodContentProps) {
	const { showSuccessToast, showErrorToast } = useToast();
	const { sendVerificationEmail, toggleEmailVerification, getUserEmailVerificationStatus } = useLoginMethods(userId);

	const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
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
			className={styles["login-method-content"]}>
			{/* User ID */}
			<Flex
				align="center"
				gap="2"
				mb="4">
				<ItemLabel className={styles["login-method-content__item-label"]}>User ID:</ItemLabel>
				<CopyBox
					text={loginMethod.recipeUserId}
					name="Recipe User ID"
				/>
			</Flex>

			<Separator
				my="4"
				fullWidth
			/>

			{/* Email */}
			{loginMethod.email && (
				<>
					<Flex
						align="center"
						gap="2"
						mb="4">
						<ItemLabel className={styles["login-method-content__item-label"]}>Email:</ItemLabel>
						<ItemValue>{loginMethod.email}</ItemValue>
						{loginMethod.recipeId !== "thirdparty" && (
							<Pencil1Icon
								onClick={onEditClick}
								style={{ cursor: "pointer" }}
							/>
						)}
					</Flex>

					<Separator
						my="4"
						fullWidth
					/>
				</>
			)}

			{/* Phone */}
			{loginMethod.recipeId === "passwordless" && (
				<>
					<Flex
						align="center"
						gap="2"
						mb="4">
						<ItemLabel className={styles["login-method-content__item-label"]}>Phone Number:</ItemLabel>
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

					<Separator
						my="4"
						fullWidth
					/>
				</>
			)}

			{/* Provider Info for Third Party */}
			{loginMethod.thirdParty && (
				<>
					<Flex
						align="center"
						gap="2"
						mb="4">
						<ItemLabel className={styles["login-method-content__item-label"]}>Provider ID:</ItemLabel>
						<ItemValue>{loginMethod.thirdParty.userId}</ItemValue>
					</Flex>

					<Separator
						my="4"
						fullWidth
					/>
				</>
			)}

			{/* Actions */}
			<Flex
				gap="2"
				wrap="wrap">
				{loginMethod.recipeId === "emailpassword" && (
					<Button
						size="2"
						variant="outline"
						onClick={() => setOpenChangePasswordModal(true)}>
						Change Password
					</Button>
				)}
				{loginMethod.email && (
					<>
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
							color={loginMethod.verified ? "red" : "green"}
							onClick={handleToggleVerification}>
							{loginMethod.verified ? <CrossCircledIcon /> : <CheckCircledIcon />}
							{loginMethod.verified ? "Set Unverified" : "Set Verified"}
						</Button>
					</>
				)}
			</Flex>

			<ChangePasswordModal
				open={openChangePasswordModal}
				handleClose={() => setOpenChangePasswordModal(false)}
				recipeUserId={loginMethod.recipeUserId}
				userId={userId}
				tenantId={loginMethod.tenantIds[0]}
			/>
		</Box>
	);
}
