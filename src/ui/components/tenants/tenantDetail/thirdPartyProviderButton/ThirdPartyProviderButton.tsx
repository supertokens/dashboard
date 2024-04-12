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
import { getImageUrl } from "../../../../../utils";
import "./thirdPartyProviderButton.scss";

type ThirdPartyProviderButtonPropsBase = {
	title: string;
	onClick?: () => void;
	disabled?: boolean;
};

type ThirdPartyProviderButtonPropsWithIcon = ThirdPartyProviderButtonPropsBase & {
	icon: string;
	type?: "with-icon";
};

type ThirdPartyProviderButtonPropsWithoutIcon = ThirdPartyProviderButtonPropsBase & {
	type: "without-icon";
};

export type ThirdPartyProviderButtonProps =
	| ThirdPartyProviderButtonPropsWithIcon
	| ThirdPartyProviderButtonPropsWithoutIcon;

export const ThirdPartyProviderButton = (props: ThirdPartyProviderButtonProps) => {
	return (
		<button
			className={"third-party-provider-cta"}
			onClick={props.onClick}
			disabled={props.disabled}>
			{props.type === "without-icon" ? (
				<div className="third-party-provider-cta__logo-container">
					<span>+ {props.title}</span>
				</div>
			) : (
				<div className="third-party-provider-cta__logo-container">
					<img
						src={getImageUrl(props.icon)}
						alt={`${props.title} icon`}
						className="third-party-provider-cta__icon"
					/>
					<span className="third-party-provider-cta__divider">|</span>
					<span>{props.title}</span>
				</div>
			)}
		</button>
	);
};
