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
import { useState } from "react";
import { ReactComponent as CloseIconActive } from "../../../assets/close-active.svg";
import { ReactComponent as CloseIconDefault } from "../../../assets/close-inactive.svg";

import "./deleteCrossButton.scss";

export const DeleteCrossButton = ({
	onClick,
	label,
	disabled,
}: {
	onClick: () => void;
	label: string;
	disabled?: boolean;
}) => {
	const [isHovered, setIsHovered] = useState(false);
	return (
		<button
			className="delete-cross-button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			{isHovered && !disabled ? <CloseIconActive /> : <CloseIconDefault />}
		</button>
	);
};
