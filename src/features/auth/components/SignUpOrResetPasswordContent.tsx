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
import HighlightJS from "highlight.js";
import BashHighlight from "highlight.js/lib/languages/bash";
import React, { useEffect } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { ContentMode } from "./types";
import styles from "./SignUpOrResetPasswordContent.module.scss";
import { ArrowLeftIcon, CopyIcon } from "@radix-ui/react-icons";
import { copyToClipboard } from "@shared/utils/copyToClipboard";
import { useToast } from "@shared/components/toast";
import { withOverride } from "@plugins";
import { getConnectionUri } from "@shared/utils";

interface ISignUpOrResetPasswordContentProps {
	contentMode: Exclude<ContentMode, "sign-in">;
	onBack: () => void;
}

interface IContentForMode {
	title: string;
	subtitle: string;
	endpoint: string;
	method: string;
	rawData: string;
}

const commonHeaders = `
--header 'rid: dashboard' \\
--header 'api-key: <YOUR-API-KEY>' \\
--header 'Content-Type: application/json' \\
`;

const SignUpOrResetPasswordContent = withOverride(
	"SignUpOrResetPasswordContent",
	function SignUpOrResetPasswordContent(props: ISignUpOrResetPasswordContentProps) {
		const { contentMode, onBack } = props;
		const { showSuccessToast, showErrorToast } = useToast();

		useEffect(() => {
			HighlightJS.registerLanguage("bash", BashHighlight);
			HighlightJS.initHighlightingOnLoad();
		});

		const getContentForMode = (): IContentForMode => {
			switch (contentMode) {
				case "sign-up":
					return {
						title: "Sign Up",
						subtitle: "Run the below command in your terminal",
						endpoint: "/recipe/dashboard/user",
						method: "POST",
						// eslint-disable-next-line @typescript-eslint/quotes
						rawData: `"email": "<YOUR_EMAIL>","password": "<YOUR_PASSWORD>"`,
					};
				case "forgot-password":
					return {
						title: "Reset your password",
						subtitle: "Run the below command in your terminal",
						endpoint: "/recipe/dashboard/user",
						method: "PUT",
						// eslint-disable-next-line @typescript-eslint/quotes
						rawData: `"email": "<YOUR_EMAIL>","newPassword": "<YOUR_NEW_PASSWORD>"`,
					};
				default:
					throw Error("No content found for the prop!");
			}
		};

		const { title, subtitle, endpoint, method, rawData } = getContentForMode();

		const command = `curl --location --request ${method} '${getConnectionUri()}${endpoint}' \\
${commonHeaders.trim()}
--data-raw '{${rawData}}'`;

		const highlightedCode = HighlightJS.highlight(command, {
			language: "bash",
		});

		return (
			<section>
				<Flex
					direction="column"
					className={styles["content-container"]}>
					<h2 className={styles["content-container__title"]}>{title}</h2>
					<Text
						size="2"
						className={styles["content-container__subtitle"]}>
						{subtitle}
					</Text>
					<div className={styles["command-container"]}>
						<code
							className={`${styles["command-container__code"]} with-thin-scrollbar bold-400`}
							dangerouslySetInnerHTML={{
								__html: highlightedCode.value,
							}}
						/>
						{/* TODO: VERIFY THIS */}
						<div className={styles["command-container__tooltip"]}>
							<CopyIcon
								onClick={(e) => {
									e.stopPropagation();
									void copyToClipboard(
										command,
										() => {
											showSuccessToast("Success", "Command copied to clipboard.");
										},
										() => {
											showErrorToast("Failed to copy command to clipboard.");
										}
									);
								}}
							/>
						</div>
					</div>
					<Flex
						className={styles["cta-container"]}
						justify="between"
						align="center">
						<div />
						{contentMode === "sign-up" ? (
							<Text
								size="2"
								className={styles["content-container__subtitle"]}>
								Account exists?{" "}
								<span
									className={styles["content-container__link"]}
									role="button"
									onClick={onBack}>
									Sign In
								</span>
							</Text>
						) : (
							<Button
								variant="ghost"
								onClick={onBack}
								className={styles["cta-container__back-button"]}>
								<ArrowLeftIcon />
								Back
							</Button>
						)}
					</Flex>
				</Flex>
			</section>
		);
	}
);

export default SignUpOrResetPasswordContent;
