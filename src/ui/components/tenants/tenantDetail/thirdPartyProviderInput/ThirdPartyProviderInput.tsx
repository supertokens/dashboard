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
			<ThirdPartyProviderInputLabel
				htmlFor={rest.name}
				label={label ?? ""}
				tooltip={props.tooltip}
				isRequired={props.isRequired}
				minLabelWidth={props.minLabelWidth}
			/>

			<InputField {...rest} />
		</div>
	);
};

export const ThirdPartyProviderInputLabel = ({
	htmlFor,
	label,
	tooltip,
	isRequired,
	minLabelWidth,
}: {
	htmlFor?: string;
	label: string;
	tooltip?: string;
	isRequired?: boolean;
	minLabelWidth?: number;
}) => {
	return (
		<div
			className="third-party-provider-input-container__label-container"
			style={{
				minWidth: minLabelWidth ? `${minLabelWidth}px` : undefined,
			}}>
			{tooltip && (
				<TooltipContainer
					tooltip={tooltip}
					position="bottom">
					<InfoIcon />
				</TooltipContainer>
			)}
			{label && (
				<label
					htmlFor={htmlFor}
					className="third-party-provider-input-container__label">
					{label} {isRequired && <span className="third-party-provider-input-container__required">* </span>}:
				</label>
			)}
		</div>
	);
};
