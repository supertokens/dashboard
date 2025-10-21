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

import { Box, Flex, Text } from "@radix-ui/themes";
import { PlusIcon } from "@radix-ui/react-icons";

import { Modal } from "@shared/components/modal";
import Button from "@shared/components/button";
import { getImageUrl } from "@shared/utils/index";

import styles from "./AddNewProviderModal.module.scss";

const ENTERPRISE_PROVIDERS = [
	{
		id: "google-workspaces",
		label: "Google Workspaces",
		icon: "google.png",
	},
	{
		id: "active-directory",
		label: "Active Directory",
		icon: "active-directory.png",
	},

	{
		id: "okta",
		label: "Okta",
		icon: "okta.png",
	},
];

const SOCIAL_PROVIDERS = [
	{
		id: "google",
		label: "Google",
		icon: "google.png",
	},
	{
		id: "apple",
		label: "Apple",
		icon: "apple.svg",
	},
	{
		id: "discord",
		label: "Discord",
		icon: "discord.png",
	},
	{
		id: "facebook",
		label: "Facebook",
		icon: "facebook.png",
	},
	{
		id: "github",
		label: "GitHub",
		icon: "github.png",
	},
	{
		id: "linkedin",
		label: "LinkedIn",
		icon: "linkedin.png",
	},
	{
		id: "x",
		label: "X",
		icon: "x.png",
	},
	{
		id: "bitbucket",
		label: "Bitbucket",
		icon: "bitbucket.png",
	},
	{
		id: "gitlab",
		label: "GitLab",
		icon: "gitlab.png",
	},
];

interface AddNewProviderModalProps {
	open: boolean;
	handleClose: () => void;
	tenantId: string;
	onProviderSelected?: (providerId: string) => void;
}

export default function AddNewProviderModal({
	open,
	handleClose,
	tenantId,
	onProviderSelected,
}: AddNewProviderModalProps) {
	const handleSelectProvider = (providerId: string) => {
		if (onProviderSelected) {
			onProviderSelected(providerId);
		}
		handleClose();
	};
	return (
		<Modal
			title="Add New Provider"
			open={open}
			handleClose={handleClose}
			size="lg">
			<Flex
				direction="column"
				className={styles["add-new-provider-modal"]}>
				<Flex className={styles["add-new-provider-modal__heading"]}>
					<Text className={styles["add-new-provider-modal__heading__text"]}>
						Select the Provider that you want to add for you tenant from the list below
					</Text>
				</Flex>
				<Flex
					direction="column"
					className={styles["add-new-provider-modal__providers"]}>
					<Text className={styles["add-new-provider-modal__providers__label"]}>
						Enterprise Providers (OAuth)
					</Text>
					<Flex className={styles["add-new-provider-modal__providers__list"]}>
						{ENTERPRISE_PROVIDERS.map((provider) => (
							<Box
								key={provider.id}
								className={styles["add-new-provider-modal__providers__list__item"]}>
								<Button
									variant="outline"
									color="gray"
									radius="large"
									onClick={() => handleSelectProvider(provider.id)}
									className={styles["add-new-provider-modal__providers__list__item__button"]}>
									<img
										src={getImageUrl(provider.icon)}
										alt={provider.label}
										width="30px"
										height="30px"
									/>
									{provider.label}
								</Button>
							</Box>
						))}
					</Flex>
				</Flex>
				<Flex className={styles["add-new-provider-modal__providers"]}>
					<Text className={styles["add-new-provider-modal__providers__label"]}>Social Providers (OAuth)</Text>
					<Flex className={styles["add-new-provider-modal__providers__list"]}>
						{SOCIAL_PROVIDERS.map((provider) => (
							<Box
								key={provider.id}
								className={styles["add-new-provider-modal__providers__list__item"]}>
								<Button
									variant="outline"
									color="gray"
									radius="large"
									onClick={() => handleSelectProvider(provider.id)}
									className={styles["add-new-provider-modal__providers__list__item__button"]}>
									<img
										src={getImageUrl(provider.icon)}
										alt={provider.label}
										width="30px"
										height="30px"
									/>
									{provider.label}
								</Button>
							</Box>
						))}
					</Flex>
				</Flex>
				<Flex className={styles["add-new-provider-modal__providers"]}>
					<Text className={styles["add-new-provider-modal__providers__label"]}>Custom OAuth Providers</Text>
					<Button
						variant="outline"
						color="gray"
						radius="large"
						onClick={() => handleSelectProvider("custom")}
						className={styles["add-new-provider-modal__providers__list__item__button"]}>
						<PlusIcon /> Add Custom Provider
					</Button>
				</Flex>
				<Flex className={styles["add-new-provider-modal__providers"]}>
					<Text className={styles["add-new-provider-modal__providers__label"]}>SAML Providers</Text>
					<Button
						variant="outline"
						radius="large"
						color="gray"
						onClick={() => handleSelectProvider("boxy-saml")}
						className={styles["add-new-provider-modal__providers__list__item__button"]}>
						<PlusIcon /> Add SAML Provider
					</Button>
				</Flex>
			</Flex>
		</Modal>
	);
}
