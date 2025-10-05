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

import { Box, Flex } from "@radix-ui/themes";

import Button from "@shared/components/button";
import Separator from "@shared/components/separator";

import { LoginMethod } from "@features/users/types";
import { ChangePasswordModal } from "../modals";

import EmailField from "./EmailField";
import EmailVerificationActions from "./EmailVerificationActions";
import { useEmailVerification } from "./useEmailVerification";
import styles from "./EmailPasswordLoginMethodContent.module.scss";

interface EmailPasswordLoginMethodContentProps {
	readonly loginMethod: LoginMethod;
	readonly userId: string;
	readonly onEditClick: () => void;
}

export default function EmailPasswordLoginMethodContent({
	loginMethod,
	userId,
	onEditClick,
}: EmailPasswordLoginMethodContentProps) {
	const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
	const { isSendingEmail, handleSendVerificationEmail, handleToggleVerification } = useEmailVerification({
		userId,
		recipeUserId: loginMethod.recipeUserId,
		tenantId: loginMethod.tenantIds[0],
		isVerified: loginMethod.verified,
	});

	return (
		<Box
			p="4"
			className={styles["email-password-login-method-content"]}>
			{/* Email */}
			<EmailField
				email={loginMethod.email || ""}
				isVerified={loginMethod.verified}
				showEditIcon
				onEditClick={onEditClick}
				className={styles["email-password-login-method-content__item-label"]}
			/>

			<Separator
				my="4"
				fullWidth
			/>

			{/* Actions */}
			<Flex
				gap="2"
				wrap="wrap">
				<Button
					size="2"
					variant="outline"
					onClick={() => setOpenChangePasswordModal(true)}>
					Change Password
				</Button>
				<EmailVerificationActions
					isVerified={loginMethod.verified}
					isSendingEmail={isSendingEmail}
					onSendVerificationEmail={handleSendVerificationEmail}
					onToggleVerification={handleToggleVerification}
				/>
			</Flex>

			<ChangePasswordModal
				open={openChangePasswordModal}
				handleClose={() => setOpenChangePasswordModal(false)}
				recipeUserId={loginMethod.recipeUserId}
				userId={userId}
				tenantIds={loginMethod.tenantIds}
			/>
		</Box>
	);
}
