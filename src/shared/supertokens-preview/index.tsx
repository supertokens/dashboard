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

import React, { useMemo } from "react";
import { Flex, Text, TextField } from "@radix-ui/themes";

import { getImageUrl } from "@shared/utils";
import { Button, ButtonProps } from "@radix-ui/themes";
import { FactorIds } from "@constants";

import styles from "./index.module.scss";

type FactorIds = typeof FactorIds[keyof typeof FactorIds];

const InputField = () => {
	return <TextField.Root className={styles["supertokens-preview__input-field"]} />;
};

const SubmitButton = ({ text, ...props }: { text: string } & ButtonProps) => {
	return (
		<Button
			className={styles["supertokens-preview__submit-button"]}
			{...props}>
			<Text className={styles["supertokens-preview__submit-button__text"]}>{text}</Text>
		</Button>
	);
};

const Separator = ({ fullWidth = false }: { fullWidth?: boolean }) => {
	return (
		<div
			className={
				styles["supertokens-preview__separator"] + (fullWidth ? " supertokens-preview__separator--full" : "")
			}
		/>
	);
};

const ThirdPartyButton = ({ icon, text }: { icon: string; text: string }) => {
	return (
		<Flex
			justify="center"
			align="center"
			className={styles["supertokens-preview__third-party__button"]}>
			<img
				src={getImageUrl(icon)}
				alt={text}
				width={16}
				height={16}
			/>
			<Text>{text}</Text>
		</Flex>
	);
};

const hasMultifactorEmailEnabled = (enabledFirstFactors: FactorIds[]) => {
	return enabledFirstFactors.includes(FactorIds.OTP_EMAIL) || enabledFirstFactors.includes(FactorIds.LINK_EMAIL);
};

const hasMultifactorPhoneEnabled = (enabledFirstFactors: FactorIds[]) => {
	return enabledFirstFactors.includes(FactorIds.OTP_PHONE) || enabledFirstFactors.includes(FactorIds.LINK_PHONE);
};

const hasEmailPasswordEnabled = (enabledFirstFactors: FactorIds[]) => {
	return enabledFirstFactors.includes(FactorIds.EMAILPASSWORD);
};

const hasThirdPartyEnabled = (enabledFirstFactors: FactorIds[]) => {
	return enabledFirstFactors.includes(FactorIds.THIRDPARTY);
};

interface SupertokensPreviewProps {
	enabledFirstFactors: typeof FactorIds[keyof typeof FactorIds][];
}

export const SupertokensPreview = ({ enabledFirstFactors }: SupertokensPreviewProps) => {
	const factorChecks = useMemo(() => {
		const isMultifactorEmailEnabled = hasMultifactorEmailEnabled(enabledFirstFactors);
		const isMultifactorPhoneEnabled = hasMultifactorPhoneEnabled(enabledFirstFactors);
		const isMultifactorEnabled = isMultifactorEmailEnabled || isMultifactorPhoneEnabled;
		const isEmailPasswordEnabled = hasEmailPasswordEnabled(enabledFirstFactors);
		const isThirdPartyEnabled = hasThirdPartyEnabled(enabledFirstFactors);

		return {
			isMultifactorEmailEnabled,
			isMultifactorPhoneEnabled,
			isMultifactorEnabled,
			isEmailPasswordEnabled,
			isThirdPartyEnabled,
		};
	}, [enabledFirstFactors]);

	const displayConditions = useMemo(() => {
		const showThirdParty = factorChecks.isThirdPartyEnabled;
		const showEmailPassword = factorChecks.isEmailPasswordEnabled && !factorChecks.isMultifactorEnabled;
		const showMultifactor = factorChecks.isMultifactorEnabled;
		const showOr = showThirdParty && (showEmailPassword || showMultifactor);

		return {
			showThirdParty,
			showEmailPassword,
			showMultifactor,
			showOr,
		};
	}, [factorChecks]);

	const mfaConditions = useMemo(() => {
		const showEmailLabel = factorChecks.isMultifactorEmailEnabled || factorChecks.isEmailPasswordEnabled;
		const showPhoneOption =
			factorChecks.isMultifactorPhoneEnabled &&
			(factorChecks.isMultifactorEmailEnabled || factorChecks.isEmailPasswordEnabled);

		return {
			inputLabel: showEmailLabel ? "Email" : "Phone Number",
			showPhoneOption,
		};
	}, [factorChecks]);

	return (
		<Flex
			className={styles["supertokens-preview"]}
			direction="column"
			align="center">
			{/* Heading and subtitle */}
			<Text className={styles["supertokens-preview__title"]}>Sign In</Text>
			<Text className={styles["supertokens-preview__subtitle"]}>
				Not registered yet? <strong>Sign Up</strong>
			</Text>

			{/* Separator */}
			<Separator fullWidth />

			{/* Third party buttons */}
			{displayConditions.showThirdParty && (
				<Flex
					className={styles["supertokens-preview__third-party"]}
					gap="3"
					direction="column"
					justify="center"
					align="center">
					<ThirdPartyButton
						icon="google.png"
						text="Continue with Google"
					/>
					<ThirdPartyButton
						icon="github.png"
						text="Continue with GitHub"
					/>
				</Flex>
			)}

			{/* Or */}
			{displayConditions.showOr && (
				<Flex
					gap="3"
					align="center"
					justify="center"
					className={styles["supertokens-preview__or"]}>
					<Separator />
					<Text>Or</Text>
					<Separator />
				</Flex>
			)}

			{/* MFA */}
			{displayConditions.showMultifactor && (
				<Flex
					direction="column"
					className={styles["supertokens-preview__mfa-container"]}>
					<Flex
						justify="between"
						align="center"
						className={styles["supertokens-preview__mfa-label"]}
						mb="2">
						<Text>{mfaConditions.inputLabel}</Text>
						{mfaConditions.showPhoneOption && (
							<Text className={styles["supertokens-preview__mfa-label__subtext"]}>
								Use a phone number
							</Text>
						)}
					</Flex>
					<InputField />
					<SubmitButton
						text="Continue"
						mt="4"
					/>
				</Flex>
			)}

			{/* Email Password */}
			{displayConditions.showEmailPassword && (
				<Flex
					className={styles["supertokens-preview__email-password"]}
					direction="column"
					gap="3">
					<Flex
						direction="column"
						className={styles["supertokens-preview__email-password-item"]}>
						<Text>Email</Text>
						<InputField />
					</Flex>
					<Flex
						direction="column"
						className={styles["supertokens-preview__email-password-item"]}>
						<Text>Password</Text>
						<InputField />
					</Flex>

					<SubmitButton text="Sign In" />
				</Flex>
			)}
			<Flex
				px="3"
				py="2"
				className={styles["supertokens-preview__powered-by"]}>
				{" "}
				Powered By <strong> SuperTokens</strong>
			</Flex>
		</Flex>
	);
};
