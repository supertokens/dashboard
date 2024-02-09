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

import { ChangeEvent, useState } from "react";

import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import InputField from "../../../inputField/InputField";

import { NativeSelect } from "../../../nativeSelect/NativeSelect";
import { Toggle } from "../../../toggle/Toggle";
import "./addNewConfigProperty.scss";

// TODO: This will be coming from the API
const CORE_CONFIG_PROPERTIES = [
	{
		name: "supertokens_max_cdi_version",
		description:
			"This is used when the core needs to assume a specific CDI version when CDI version is not specified in the request. When set to null, the core will assume the latest version of the CDI. (Default: null)",
		isDifferentAcrossTenants: false,
		type: "string",
	},
	{
		name: "disable_telemetry",
		description:
			"Learn more about Telemetry here: https://github.com/supertokens/supertokens-core/wiki/Telemetry. (Default: false)",
		isDifferentAcrossTenants: false,
		type: "boolean",
	},
	{
		name: "email_verification_token_lifetime",
		description:
			"Time in milliseconds for how long an email verification token / link is valid for. [Default: 24 * 3600 * 1000 (1 day)]",
		isDifferentAcrossTenants: true,
		type: "number",
	},
	{
		name: "firebase_password_hashing_signer_key",
		description: "The signer key used for firebase scrypt password hashing. (Default: null)",
		isDifferentAcrossTenants: false,
		type: "string",
	},
	{
		name: "passwordless_max_code_input_attempts",
		description:
			"The maximum number of code input attempts per login before the user needs to restart. (Default: 5)",
		isDifferentAcrossTenants: true,
		type: "number",
	},
];

export const AddNewConfigPropertyDialog = ({
	onCloseDialog,
}: // alreadyAddedPropertyKeys,
{
	onCloseDialog: () => void;
	// alreadyAddedPropertyKeys: Array<string>;
}) => {
	const [error, setError] = useState<string | undefined>(undefined);
	const [value, setValue] = useState<string | boolean | undefined>(undefined);
	const [propertyKey, setPropertyKey] = useState<string | undefined>(undefined);
	const property = CORE_CONFIG_PROPERTIES.find((property) => property.name === propertyKey);

	const handlePropertyChange = (e: ChangeEvent<HTMLSelectElement>) => {
		setPropertyKey(e.target.value);
		setError(undefined);
		const currentPropertyType = CORE_CONFIG_PROPERTIES.find((property) => property.name === e.target.value)?.type;
		if (currentPropertyType === "boolean") {
			setValue(false);
		} else {
			setValue("");
		}
	};

	return (
		<Dialog
			title="Add new Property"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<form>
					<div className="add-new-config-property-dialog-container">
						<NativeSelect
							label="Property Name"
							value={propertyKey ?? ""}
							onChange={handlePropertyChange}
							options={CORE_CONFIG_PROPERTIES.map((property) => property.name)}
						/>
						{property && (
							<>
								{(property.type === "string" || property.type === "number") && (
									<InputField
										error={error}
										forceShowError={true}
										label="Value"
										name="value"
										type="text"
										value={`${value}`}
										hideColon
										handleChange={(e) => {
											setError(undefined);
											setValue(e.target.value);
										}}
									/>
								)}
								{property.type === "boolean" && (
									<Toggle
										name="value"
										id="value"
										label="Value"
										checked={value as boolean}
										onChange={(e) => {
											setValue(e.target.checked);
										}}
									/>
								)}
							</>
						)}
						{typeof property?.description === "string" && property.description.length > 0 && (
							<div className="block-info block-medium text-small">
								<div className="note-pill">Note</div>
								<p>{property?.description}</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button
							onClick={onCloseDialog}
							color="gray-outline"
							type="button">
							Go Back
						</Button>
						<Button type="submit">Done</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
