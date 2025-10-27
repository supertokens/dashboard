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

import { Flex } from "@radix-ui/themes";

import { SignOutBtn } from "@features/auth";
import { getImageUrl } from "@shared/utils";

import styles from "./Header.module.scss";
import { withOverride } from "@plugins";

const LOGO_LIGHT = getImageUrl("ST_icon_light_theme.svg");

const Header = withOverride("Header", function Header() {
	return (
		<header className={styles["header"]}>
			<Flex
				align="center"
				justify="between"
				className={styles["header__content"]}>
				<img
					className={styles["header__logo"]}
					src={LOGO_LIGHT}
					alt="SuperTokens"
				/>
				<div className={styles["header__actions"]}>
					<SignOutBtn />
				</div>
			</Flex>
		</header>
	);
});

export default Header;
