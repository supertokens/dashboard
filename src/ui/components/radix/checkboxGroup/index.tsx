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
import React from "react";
import { CheckboxGroup as CheckboxGroupRadix } from "@radix-ui/themes";

import "./index.scss";

/**
 * Extended props interface for CheckboxGroup.Root that includes children property.
 * This is needed because the original Radix UI CheckboxGroup.Root component type
 * definition doesn't include children as an accepted prop, causing TypeScript errors
 * when trying to pass child elements to the component.
 *
 * This is a known issue with Radix UI primitives TypeScript definitions:
 * @see https://github.com/radix-ui/primitives/issues/2309
 */
interface ExtendedCheckboxGroupRootProps extends React.ComponentPropsWithRef<typeof CheckboxGroupRadix.Root> {
	children?: React.ReactNode;
	className?: string;
}

/**
 * Extended CheckboxGroup.Root component that accepts children.
 * We cast the original component to our extended interface to bypass TypeScript's
 * type checking and allow children to be passed to the component.
 */
const ExtendedCheckboxGroupRoot = CheckboxGroupRadix.Root as React.FC<ExtendedCheckboxGroupRootProps>;

/**
 * Drop-in replacement for Radix UI's CheckboxGroup that supports children in the Root component.
 * This works around the known TypeScript typing issue in Radix UI primitives where components
 * functionally accept children but the type definitions don't include them.
 *
 * Only the Root component needed extension as it was the one causing TypeScript errors.
 * The Item component works fine with its original type definitions.
 */
const CheckboxGroup = {
	Root: ExtendedCheckboxGroupRoot,
	Item: CheckboxGroupRadix.Item,
};

export default CheckboxGroup;
