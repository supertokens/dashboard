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

	const getTextContent = () => {
		switch (contentMode) {
			case "sign-up":
				return {
					title: "Sign Up",
					subtitle: "Insert the below command in your backend configuration to create a new user",
				};
			case "forgot-password":
				return {
					title: "Reset your password",
					subtitle: "Run the below command in your terminal",
				};
			default:
				throw Error("No content found for the prop!");
		}
	};

	const { title, subtitle } = getTextContent();

	const command = `curl --location --request POST 'http://localhost:3567/recipe/user/passwordhash/import' \
		--header 'api-key: <API_KEY(if configured)>' \
		--header 'Content-Type: application/json' \
		--data-raw '{
			"email": "johndoe@example.com",
			"passwordHash": "$argon2d$v=19$m=12,t=3,p=1$NWd0eGp4ZW91b3IwMDAwMA$57jcfXF19MyiUXSjkVBpEQ"
		}'`;

	const copyClickHandler = async () => {
		try {
			await navigator.clipboard.writeText(command);
			setShowCopiedTooltip(true);
		} catch (error) {
			throw Error("failed to copy the command");
		}
	};

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
