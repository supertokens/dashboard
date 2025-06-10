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

import { Flex, Skeleton, Spinner } from "@radix-ui/themes";

export default function Loader({ type }: { type: "inline" | "list" | "page" }) {
	switch (type) {
		case "inline":
			return <Spinner size="2" />;
		case "list":
			return (
				<Flex
					direction="column"
					width="100%"
					gap="4">
					<Skeleton
						width="100%"
						height="40px"
					/>
					<Skeleton
						width="100%"
						height="20px"
					/>
					<Skeleton
						width="100%"
						height="20px"
					/>
					<Skeleton
						width="100%"
						height="20px"
					/>
					<Skeleton
						width="100%"
						height="20px"
					/>
					<Skeleton
						width="70%"
						height="20px"
					/>
				</Flex>
			);
		case "page":
			return (
				<Flex
					minHeight="70vh"
					width="100%"
					justify="center"
					align="center">
					<Spinner size="2" />
				</Flex>
			);
	}
}
