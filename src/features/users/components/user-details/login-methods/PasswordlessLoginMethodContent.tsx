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

import { Pencil1Icon } from "@radix-ui/react-icons";
import { Box, Flex } from "@radix-ui/themes";

import ItemLabel from "@shared/components/itemLabel";
import ItemValue from "@shared/components/itemValue";
import Separator from "@shared/components/separator";

import { LoginMethod } from "@features/users/types";

import EmailField from "./EmailField";
import EmailVerificationActions from "./EmailVerificationActions";
import { useEmailVerification } from "./useEmailVerification";
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
	const { isSendingEmail, handleSendVerificationEmail, handleToggleVerification } = useEmailVerification({
		userId,
		recipeUserId: loginMethod.recipeUserId,
		tenantId: loginMethod.tenantIds[0],
		isVerified: loginMethod.verified,
	});

	return (
		<Box
			p="4"
			className={styles["passwordless-login-method-content"]}>
			{/* Email */}
			{loginMethod.email && (
				<>
					<EmailField
						email={loginMethod.email}
						isVerified={loginMethod.verified}
						showEditIcon
						onEditClick={onEditClick}
						className={styles["passwordless-login-method-content__item-label"]}
					/>
				</>
			)}

			{loginMethod.email && loginMethod.phoneNumber ? (
				<Separator
					my="4"
					fullWidth
				/>
			) : null}

			{/* Phone Number */}
			{loginMethod.phoneNumber && (
				<>
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
