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

import { Flex, Skeleton, Spinner } from "@radix-ui/themes";
import Paper from "../paper";
import { assertNever } from "@shared/utils/assertNever";

import styles from "./index.module.scss";

type LoaderType = "inline" | "list" | "table-with-list" | "page";

const ListSkeleton = () => {
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
};

export default function Loader({ type }: { type: LoaderType }) {
	switch (type) {
		case "inline":
			return (
				<Spinner
					size="2"
					mx="auto"
				/>
			);
		case "list":
			return <ListSkeleton />;
		case "table-with-list":
			return (
				<Paper width="100%">
					<ListSkeleton />
				</Paper>
			);

		case "page":
			return (
				<Flex
					justify="center"
					align="center"
					className={styles["full-page-loader"]}>
					<Spinner
						size="3"
						ml="2"
					/>
				</Flex>
			);
		default:
			assertNever(type);
	}
}
