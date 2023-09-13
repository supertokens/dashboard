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
import { PropsWithChildren, createContext, useContext, useState } from "react";
import { Tenant } from "../../../../api/tenants/list";
import { User } from "../../../pages/usersList/types";
import UserDetail from "../userDetail";
import { SessionInfo } from "../userDetailSessionList";

type UserDetailContextType = {
	showLoadingOverlay: () => void;
	hideLoadingOverlay: () => void;
	userDetail: UserDetails;
	setUserDetails: (val: UserDetails) => void;
};

export type UserDetails = {
	userId: string;
	details: User;
	metaData: string | undefined;
	sessions: { sessionHandle: string; timeCreated: number; expiry: number }[] | undefined;
	func: {
		refetchAllData: () => Promise<void>;
		updateUser: (
			userId: string,
			data: User,
			tenantListFromStore: Tenant[] | undefined
		) => Promise<{ status: string; error?: string }>;
		onUpdateEmailVerificationStatusCallback: (
			userId: string,
			isVerified: boolean,
			tenantId: string | undefined
		) => Promise<boolean>;
	};
};

type IncomingProps = {
	showLoadingOverlay: () => void;
	hideLoadingOverlay: () => void;
	metaData: string | undefined;
	sessions: SessionInfo[] | undefined;
	details: User;
	userId: string;
	func: UserFuncs;
};

export type UserFuncs = {
	refetchAllData: () => Promise<void>;
	updateUser: (
		userId: string,
		data: User,
		tenantListFromStore: Tenant[] | undefined
	) => Promise<{ status: string; error?: string }>;
	onUpdateEmailVerificationStatusCallback: (
		userId: string,
		isVerified: boolean,
		tenantId: string | undefined
	) => Promise<boolean>;
};

type Props = PropsWithChildren<IncomingProps>;

const UserDetailContext = createContext<UserDetailContextType | undefined>(undefined);

export const useUserDetailContext = () => {
	const context = useContext(UserDetailContext);
	if (!context) throw "Context must be used within a provider!";
	return context;
};

export const UserDetailContextProvider: React.FC<Props> = (props: Props) => {
	const [userDetails, setUserDetails] = useState<UserDetails>({
		metaData: props.metaData,
		sessions: props.sessions,
		userId: props.userId,
		details: props.details,
		func: props.func,
	});
	return (
		<UserDetailContext.Provider
			value={{
				showLoadingOverlay: props.showLoadingOverlay,
				hideLoadingOverlay: props.hideLoadingOverlay,
				userDetail: {
					metaData: props.metaData,
					sessions: props.sessions,
					userId: props.userId,
					details: props.details,
					func: props.func,
				},
				setUserDetails: (val) => setUserDetails(val),
			}}>
			{props.children}
		</UserDetailContext.Provider>
	);
};
