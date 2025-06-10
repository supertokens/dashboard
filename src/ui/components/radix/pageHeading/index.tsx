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

import { Flex, Text } from "@radix-ui/themes";

export default function PageHeading({ heading, subtitle }: { heading: string; subtitle: string }) {
	return (
		<Flex
			direction="column"
			mb="7"
			gap="1">
			<Text
				weight="bold"
				size="7"
				style={{ color: "var(--color-neutral-12)" }}>
				{heading}
			</Text>
			<Text
				size="4"
				weight="medium"
				style={{ color: "var(--color-neutral-9)" }}>
				{subtitle}
			</Text>
		</Flex>
	);
}
