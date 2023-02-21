/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
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
import { useEffect, useState } from "react";
import { getImageUrl } from "../../../utils";
import CopyText from "../copyText/CopyText";
import { ContentMode } from "./types";

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

const SignUpOrResetPasswordContent: React.FC<ISignUpOrResetPasswordContentProps> = ({
	contentMode,
	onBack,
}: ISignUpOrResetPasswordContentProps): JSX.Element => {
	const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

	useEffect(() => {
		HighlightJS.registerLanguage("bash", BashHighlight);
		HighlightJS.initHighlightingOnLoad();
	});

	useEffect(() => {
		if (showCopiedTooltip) {
			setTimeout(() => {
				setShowCopiedTooltip(false);
			}, 1000);
		}
	}, [showCopiedTooltip]);

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

	const command = `curl --location --request ${method} '${
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).connectionURI
	}${endpoint}' \\
${commonHeaders.trim()}
--data-raw '{${rawData}}'`;

	const highlightedCode = HighlightJS.highlight(command, {
		language: "bash",
	});

	return (
		<section>
			<h2 className="api-key-form-title text-title">{title}</h2>
			<p className="text-small text-label">{subtitle}</p>
			<div className="command-container">
				<code
					className="command with-thin-scrollbar bold-400"
					dangerouslySetInnerHTML={{
						__html: highlightedCode.value,
					}}
				/>
				<div>
					<CopyText showChild={false}>{command}</CopyText>
				</div>
			</div>
			<div className="cta-container">
				<div />
				{contentMode === "sign-up" ? (
					<span className="text-small text-label">
						Account exists?{" "}
						<span
							className="link"
							role={"button"}
							onClick={onBack}>
							Sign In
						</span>
					</span>
				) : (
					<button
						className="flat secondary-cta-btn bold-400"
						onClick={onBack}>
						<img
							alt="Go back"
							className="back-chevron"
							src={getImageUrl("chevron-left.svg")}
						/>
						Back
					</button>
				)}
			</div>
		</section>
	);
};

export default SignUpOrResetPasswordContent;
