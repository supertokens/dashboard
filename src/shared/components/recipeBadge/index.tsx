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

import { Badge, BadgeProps } from "@radix-ui/themes";

import "./index.scss";

type RecipeBadgeProps = BadgeProps & {
	recipeType: "emailpassword" | "passwordless" | "thirdparty";
};

export default function RecipeBadge({ children, recipeType, ...props }: RecipeBadgeProps) {
	return (
		<Badge
			radius="full"
			size="1"
			className={`recipe-badge recipe-badge--${recipeType}`}
			{...props}>
			{children}
		</Badge>
	);
}
