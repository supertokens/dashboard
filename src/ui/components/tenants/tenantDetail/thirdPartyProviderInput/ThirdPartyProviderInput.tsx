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
import { ReactComponent as InfoIcon } from "../../../../../assets/info-icon.svg";
import InputField, { InputFieldPropTypes } from "../../../inputField/InputField";
import TooltipContainer from "../../../tooltip/tooltip";
import "./thirdPartyProviderInput.scss";

type ThirdPartyProviderInputProps = InputFieldPropTypes & {
	tooltip?: string;
	minLabelWidth?: number;
};

export const ThirdPartyProviderInput = (props: ThirdPartyProviderInputProps) => {
	const { label, ...rest } = props;
	return (
		<div className="third-party-provider-input-container">
			<div
				className="third-party-provider-input-container__label-container"
				style={{
					minWidth: props.minLabelWidth ? `${props.minLabelWidth}px` : undefined,
				}}>
				{props.tooltip && (
					<TooltipContainer
						tooltip={props.tooltip}
						position="bottom">
						<InfoIcon />
					</TooltipContainer>
				)}
				{label && (
					<label
						htmlFor={props.name}
						className="third-party-provider-input-container__label">
						{label}{" "}
						{props.isRequired && <span className="third-party-provider-input-container__required">* </span>}
						:
					</label>
				)}
			</div>
			<InputField {...rest} />
		</div>
	);
};
