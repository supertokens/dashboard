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

type InfoConnectionProps = {
	connectionURI: string;
};

const DEMO_CONNECTION_URIS = ["try.supertokens.io", "try.supertokens.com"];

const isDemoConnectionUri = (connectionURI: string) => {
	return DEMO_CONNECTION_URIS.some((domains) => connectionURI.includes(domains));
};

export const InfoConnection: React.FC<InfoConnectionProps> = ({ connectionURI }: InfoConnectionProps) => (
	<>
		{isDemoConnectionUri(connectionURI) && (
			<div className="block-info block-medium block-info-connection text-small">
				<p className="text-bold">
					connectionURI set to <span className="block-info block-snippet">{connectionURI}</span>
				</p>
				<p>
					You are connected to an instance of SuperTokens core hosted for demo purposes, this instance should
					not be used for production apps.
				</p>
			</div>
		)}
	</>
);

export default InfoConnection;
