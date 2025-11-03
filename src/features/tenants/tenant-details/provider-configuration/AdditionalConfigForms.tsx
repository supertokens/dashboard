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

import { useState, useEffect } from "react";
import { Badge, Flex, Text, TextField } from "@radix-ui/themes";

import Button from "@shared/components/button";
import ItemLabel from "@shared/components/itemLabel";
import { getImageUrl, isValidHttpUrl } from "@shared/utils/index";
import { IN_BUILT_THIRD_PARTY_PROVIDERS, SAML_PROVIDER_ID } from "@shared/constants";

import styles from "./AdditionalConfigForms.module.scss";

interface AdditionalConfigFormsProps {
	providerId: string;
	onContinue: (additionalConfig: Record<string, string>) => void;
	onCancel: () => void;
	currentAdditionalConfig?: Record<string, string>;
}

export const AdditionalConfigForms = ({
	providerId,
	onContinue,
	onCancel,
	currentAdditionalConfig,
}: AdditionalConfigFormsProps) => {
	const renderForm = () => {
		switch (providerId) {
			case "google-workspaces":
				return (
					<GoogleWorkspacesForm
						onContinue={onContinue}
						onCancel={onCancel}
					/>
				);
			case "active-directory":
				return (
					<ActiveDirectoryForm
						onContinue={onContinue}
						onCancel={onCancel}
					/>
				);
			case "okta":
				return (
					<OktaForm
						onContinue={onContinue}
						onCancel={onCancel}
					/>
				);
			case "boxy-saml":
				return (
					<BoxySamlForm
						onContinue={onContinue}
						onCancel={onCancel}
						currentAdditionalConfig={currentAdditionalConfig}
					/>
				);
			default:
				return null;
		}
	};

	const inBuiltProviderInfo = IN_BUILT_THIRD_PARTY_PROVIDERS.find((provider) => providerId.startsWith(provider.id));
	const isSAML = providerId.startsWith(SAML_PROVIDER_ID);

	const providerLabel = isSAML ? "SAML Provider" : inBuiltProviderInfo?.label ?? providerId;
	const providerIcon = isSAML ? "saml.svg" : inBuiltProviderInfo?.icon;

	return (
		<Flex
			width="100%"
			direction="column"
			className={styles["additional-config"]}>
			<Flex
				className={styles["additional-config__header"]}
				justify="between"
				align="center"
				p="3">
				<Flex
					gap="3"
					align="center">
					<ItemLabel
						size="2"
						className={styles["additional-config__header__label"]}>
						Configure new provider
					</ItemLabel>
					{providerIcon && (
						<Badge
							size="2"
							variant="soft"
							color="gray"
							className={styles["additional-config__header__badge"]}>
							<img
								src={getImageUrl(providerIcon)}
								alt={providerLabel}
								width="16px"
								height="16px"
							/>
							<Text
								size="2"
								weight="medium">
								{providerLabel}
							</Text>
						</Badge>
					)}
				</Flex>
			</Flex>
			{renderForm()}
		</Flex>
	);
};

interface FormProps {
	onContinue: (additionalConfig: Record<string, string>) => void;
	onCancel: () => void;
	currentAdditionalConfig?: Record<string, string>;
}

const GoogleWorkspacesForm = ({ onContinue, onCancel }: FormProps) => {
	const [hd, setHd] = useState("");
	const [error, setError] = useState<string>("");

	const handleContinue = () => {
		if (hd.trim().length === 0) {
			setError("Please enter a valid hosted domain to continue.");
			return;
		}
		onContinue({ hd });
	};

	return (
		<Flex
			direction="column"
			p="3"
			gap="4"
			className={styles["additional-config__form"]}>
			<Text
				size="2"
				color="gray">
				Add domain you want to allow google workspace login for.
			</Text>

			<Flex
				direction="column"
				gap="2">
				<Flex
					align="center"
					gap="2">
					<Text
						size="2"
						weight="medium"
						style={{ minWidth: "120px" }}>
						Hosted Domain:
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						value={hd}
						onChange={(e) => {
							setHd(e.target.value);
							setError("");
						}}
						placeholder="example.com"
						className={styles["additional-config__form__input"]}
					/>
				</Flex>
				{error && (
					<Text
						size="1"
						color="red"
						ml="122px">
						{error}
					</Text>
				)}
			</Flex>

			<Text
				size="2"
				color="gray">
				For example: use "example.com" if you want to allow logins only from that domain. Enter " * " if you
				want to allow logins for any google workspace domain.
			</Text>

			<Flex
				justify="end"
				gap="2"
				mt="2">
				<Button
					variant="outline"
					color="gray"
					size="2"
					onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="2"
					onClick={handleContinue}>
					Continue
				</Button>
			</Flex>
		</Flex>
	);
};

const ActiveDirectoryForm = ({ onContinue, onCancel }: FormProps) => {
	const [directoryId, setDirectoryId] = useState("");
	const [error, setError] = useState<string>("");

	const handleContinue = () => {
		if (directoryId.trim().length === 0) {
			setError("Please enter a valid directory ID to continue");
			return;
		}
		onContinue({ directoryId });
	};

	return (
		<Flex
			direction="column"
			p="3"
			gap="4"
			className={styles["additional-config__form"]}>
			<Text
				size="2"
				color="gray">
				Add Active Directory Id you want the end users to authenticate against.
			</Text>

			<Flex
				direction="column"
				gap="2">
				<Flex
					align="center"
					gap="2">
					<Text
						size="2"
						weight="medium"
						style={{ minWidth: "120px" }}>
						Directory ID:
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						value={directoryId}
						onChange={(e) => {
							setDirectoryId(e.target.value);
							setError("");
						}}
						placeholder="Enter directory ID"
						className={styles["additional-config__form__input"]}
					/>
				</Flex>
				{error && (
					<Text
						size="1"
						color="red"
						ml="122px">
						{error}
					</Text>
				)}
			</Flex>

			<Text
				size="2"
				color="gray">
				For example: <code>97f9a564-fcee-4b88-ae34-a1fbc4656593</code>
			</Text>

			<Flex
				justify="end"
				gap="2"
				mt="2">
				<Button
					variant="outline"
					color="gray"
					size="2"
					onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="2"
					onClick={handleContinue}>
					Continue
				</Button>
			</Flex>
		</Flex>
	);
};

const OktaForm = ({ onContinue, onCancel }: FormProps) => {
	const [oktaDomain, setOktaDomain] = useState("");
	const [error, setError] = useState<string>("");

	const handleContinue = () => {
		if (!isValidHttpUrl(oktaDomain)) {
			setError("Please enter a valid URL.");
			return;
		}
		onContinue({ oktaDomain });
	};

	return (
		<Flex
			direction="column"
			p="3"
			gap="4"
			className={styles["additional-config__form"]}>
			<Text
				size="2"
				color="gray">
				Add base URL of your Okta Authorization server
			</Text>

			<Flex
				direction="column"
				gap="2">
				<Flex
					align="center"
					gap="2">
					<Text
						size="2"
						weight="medium"
						style={{ minWidth: "120px" }}>
						Okta Domain:
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						value={oktaDomain}
						onChange={(e) => {
							setOktaDomain(e.target.value);
							setError("");
						}}
						placeholder="https://dev-8636097.okta.com"
						className={styles["additional-config__form__input"]}
					/>
				</Flex>
				{error && (
					<Text
						size="1"
						color="red"
						ml="122px">
						{error}
					</Text>
				)}
			</Flex>

			<Text
				size="2"
				color="gray">
				For example: https://dev-8636097.okta.com
			</Text>

			<Flex
				justify="end"
				gap="2"
				mt="2">
				<Button
					variant="outline"
					color="gray"
					size="2"
					onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="2"
					onClick={handleContinue}>
					Continue
				</Button>
			</Flex>
		</Flex>
	);
};

const BoxySamlForm = ({ onContinue, onCancel, currentAdditionalConfig }: FormProps) => {
	const [boxyUrl, setBoxyUrl] = useState("");
	const [boxyAPIKey, setBoxyAPIKey] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (currentAdditionalConfig) {
			setBoxyUrl(currentAdditionalConfig?.boxyURL ?? "");
			setBoxyAPIKey(currentAdditionalConfig?.boxyAPIKey ?? "");
		}
	}, [currentAdditionalConfig]);

	const handleContinue = () => {
		const newErrors: Record<string, string> = {};

		if (!isValidHttpUrl(boxyUrl)) {
			newErrors.boxyURL = "Please enter a valid URL";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		onContinue({ boxyUrl, boxyAPIKey });
	};

	return (
		<Flex
			direction="column"
			p="3"
			gap="4"
			className={styles["additional-config__form"]}>
			<Text
				size="2"
				color="gray">
				You will need to setup <strong>BoxyHQ</strong> to add the SAML client.
			</Text>

			<Flex
				direction="column"
				gap="3"
				p="3"
				className={styles["saml-info-box"]}>
				<Text
					size="2"
					weight="bold">
					Managed Service
				</Text>
				<Text size="2">
					<a href="mailto:support@supertokens.com">Email us</a> to receive your Boxy URL and continue setup of
					your SAML client.
				</Text>
			</Flex>

			<Flex
				direction="column"
				gap="3"
				p="3"
				className={styles["saml-info-box"]}>
				<Text
					size="2"
					weight="bold">
					Self Hosted
				</Text>
				<Text size="2">
					Follow the steps in the{" "}
					<a
						href="https://boxyhq.com/docs/jackson/deploy"
						rel="noreferrer noopener"
						target="_blank">
						BoxyHQ docs
					</a>{" "}
					to get your Boxy URL and continue setup of your SAML client.
				</Text>
			</Flex>

			<Text
				size="2"
				weight="medium"
				mt="2">
				Add the Boxy Details below
			</Text>

			<Flex
				direction="column"
				gap="2">
				<Flex
					align="center"
					gap="2">
					<Text
						size="2"
						weight="medium"
						style={{ minWidth: "120px" }}>
						Boxy URL<span style={{ color: "var(--color-red-9)" }}>*</span>:
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						value={boxyUrl}
						onChange={(e) => {
							setBoxyUrl(e.target.value);
							setErrors((prev) => ({ ...prev, boxyURL: "" }));
						}}
						placeholder="Enter Boxy URL"
						className={styles["additional-config__form__input"]}
					/>
				</Flex>
				{errors.boxyURL && (
					<Text
						size="1"
						color="red"
						ml="122px">
						{errors.boxyURL}
					</Text>
				)}
			</Flex>

			<Flex
				direction="column"
				gap="2">
				<Flex
					align="center"
					gap="2">
					<Text
						size="2"
						weight="medium"
						style={{ minWidth: "120px" }}>
						Boxy API Key:
					</Text>
					<TextField.Root
						size="3"
						variant="surface"
						type="password"
						value={boxyAPIKey}
						onChange={(e) => {
							setBoxyAPIKey(e.target.value);
							setErrors((prev) => ({ ...prev, boxyAPIKey: "" }));
						}}
						placeholder="Enter Boxy API Key"
						className={styles["additional-config__form__input"]}
					/>
				</Flex>
				{errors.boxyAPIKey && (
					<Text
						size="1"
						color="red"
						ml="122px">
						{errors.boxyAPIKey}
					</Text>
				)}
			</Flex>

			<Flex
				justify="end"
				gap="2"
				mt="2">
				<Button
					variant="outline"
					color="gray"
					size="2"
					onClick={onCancel}>
					Go Back
				</Button>
				<Button
					size="2"
					onClick={handleContinue}>
					Continue
				</Button>
			</Flex>
		</Flex>
	);
};

export default AdditionalConfigForms;
