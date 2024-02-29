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
import { DeleteCrossButton } from "../../../deleteCrossButton/DeleteCrossButton";
import TooltipContainer from "../../../tooltip/tooltip";
import { ThirdPartyProviderInput } from "../thirdPartyProviderInput/ThirdPartyProviderInput";
import "./keyValueInput.scss";

type KeyValueInputProps = {
	label: string;
	tooltip?: string;
	isRequired?: boolean;
	value: Array<[string, string]>;
	onChange: (value: Array<[string, string]>) => void;
};

export const KeyValueInput = (props: KeyValueInputProps) => {
	const { label, value, tooltip, isRequired } = props;
	return (
		<div className="key-value-input-container">
			<div className="key-value-input-container__label-container">
				{tooltip && (
					<TooltipContainer
						tooltip={tooltip}
						position="bottom">
						<InfoIcon />
					</TooltipContainer>
				)}
				{label && (
					<label className="key-value-input-container__label">
						{label} {isRequired && <span className="key-value-input-container__required">* </span>}:
					</label>
				)}
			</div>

			<div className="key-value-input-container__fields-container">
				<div className="key-value-input-container__fields-list">
					{value.map((pair, index) => {
						return (
							<div
								className="key-value-input-container__field"
								key={index}>
								<ThirdPartyProviderInput
									value={pair[0]}
									handleChange={(e) => {
										const newValue: Array<[string, string]> = [
											...props.value.slice(0, index),
											[e.target.value, props.value[index][1]],
											...props.value.slice(index + 1),
										];
										props.onChange(newValue);
									}}
									label="Key"
									name="key"
									type="text"
								/>
								<ThirdPartyProviderInput
									value={pair[1]}
									handleChange={(e) => {
										const newValue: Array<[string, string]> = [
											...props.value.slice(0, index),
											[props.value[index][0], e.target.value],
											...props.value.slice(index + 1),
										];
										props.onChange(newValue);
									}}
									label="Value"
									name="value"
									type="text"
								/>
								{value.length > 1 && (
									<DeleteCrossButton
										onClick={() => props.onChange(props.value.filter((_, i) => i !== index))}
										label="Delete"
									/>
								)}
							</div>
						);
					})}
				</div>
				<div className="key-value-input-container__footer">
					<hr className="key-value-input-container__divider" />
					<button
						className="key-value-input-container__add-new"
						onClick={() => props.onChange([...props.value, ["", ""]])}>
						+ Add new
					</button>
				</div>
			</div>
		</div>
	);
};
