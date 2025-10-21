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

import { Text } from "@radix-ui/themes";
import { isUsingDemoConnectionUri } from "@shared/utils";
import Callout from "../callout";

import styles from "./index.module.scss";

export const DemoCallout = ({ connectionURI }: { connectionURI: string }) => {
	if (!isUsingDemoConnectionUri(connectionURI)) return null;
	return (
		<Callout
			size="1"
			mb="5"
			className={styles["users-list__demo-callout"]}>
			<Text
				size="2"
				weight="medium"
				className={styles["users-list__demo-callout__text"]}>
				connectionURI set to:{" "}
				<span className={styles["users-list__demo-callout__text--highlighted"]}>
					{" "}
					https://try.supertokens.com/appid-demo-dashboard{" "}
				</span>
				You are connected to an instance of SuperTokens core hosted for demo purposes, this instance should not
				be used for production apps.
			</Text>
		</Callout>
	);
};
