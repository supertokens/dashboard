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

import { getImageUrl } from "../../../utils";
import "./footer.scss";

export type FooterProps = {
	horizontalAlignment?: "left" | "center" | "right";
	verticalAlignment?: "top" | "bottom" | "center";
	colorMode?: "light" | "dark";
	size?: "normal" | "large";
};

export const LOGO_DARK = getImageUrl("ST_full_logo_dark_theme.svg");
export const LOGO_LIGHT = getImageUrl("ST_icon_light_theme.svg");
export const LOGO_ICON_LIGHT = getImageUrl("ST_full_logo_light_theme.svg");
export const LOGO_ICON_DARK = getImageUrl("ST_icon_dark_theme.svg");

export const Footer = ({ horizontalAlignment, verticalAlignment, colorMode, size }: FooterProps) => {
	return (
		<div
			className={`footer alignment-${horizontalAlignment} vertical-${verticalAlignment} color-${colorMode} size-${size}`}>
			<a
				href="https://supertokens.com/"
				target={"_blank"}
				rel="noreferrer"
				title="SuperTokens, Open Source Authentication">
				<img
					className="logo"
					src={colorMode === "dark" ? LOGO_DARK : LOGO_LIGHT}
					alt="Supertokens"></img>
			</a>
		</div>
	);
};
