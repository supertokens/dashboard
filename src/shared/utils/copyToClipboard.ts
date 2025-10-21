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

export const maskText = (text: string, mask = "*", visibleLength = 4) => {
	if (text.length <= visibleLength) {
		return text;
	}

	const start = text.slice(0, visibleLength);
	const maskLength = text.length - visibleLength;
	const maskedPortion = mask.repeat(maskLength);

	return start + maskedPortion;
};

export const copyToClipboard = async (text: string, onSuccess: () => void, onError: () => void): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		onSuccess();
		return true;
	} catch (err) {
		onError();
		return false;
	}
};
