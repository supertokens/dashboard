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
import useSessionsForUserService from "../../../api/user/sessions";
import { formatLongDate, getFormattedLongDateWithoutTime } from "../../../utils";
import { PlaceholderTableRows } from "../usersListTable/UsersListTable";
import { useUserDetailContext } from "./context/UserDetailContext";
import "./userDetailSessionList.scss";

export const UserDetailsSessionList: React.FC = () => {
	const { hideLoadingOverlay, showLoadingOverlay, userDetail } = useUserDetailContext();
	const sessionList = userDetail.sessions;
	const sessionCountText = sessionList === undefined ? "" : `(TOTAL NO OF SESSIONS: ${sessionList.length})`;
	const { deleteSessionsForUser } = useSessionsForUserService();
	const revokeAllSessions = async () => {
		showLoadingOverlay();
		try {
			if (sessionList === undefined) {
				return;
			}

			const allSessionHandles: string[] = sessionList.map((item) => item.sessionHandle);
			await deleteSessionsForUser(allSessionHandles);
			await userDetail.func.refetchAllData();
		} finally {
			hideLoadingOverlay();
		}
	};

	return (
		<div className="panel no-padding-horizontal">
			<div className="content-container">
				<div className="header">
					<span className="header-primary">
						SESSION INFORMATION <span className="header-secondary">{sessionCountText}</span>
					</span>
					<div
						className="button button-error"
						onClick={revokeAllSessions}>
						Revoke all sessions
					</div>
				</div>
				<div className="table-container">
					<table className="table">
						<thead className="thead">
							<tr className="head-row">
								<th className="w30">SESSION HANDLES</th>
								<th>CREATED TIME</th>
								<th>EXPIRES ON</th>
								<th>ACTION</th>
							</tr>
						</thead>
						<tbody>
							{sessionList === undefined && (
								<PlaceholderTableRows
									colSpan={4}
									rowCount={5}
									className={"session-info"}
								/>
							)}

							{sessionList !== undefined &&
								sessionList.length > 0 &&
								sessionList.map((session) => {
									return (
										<UserDetailsSessionListItem
											key={session.sessionHandle}
											sessionHandle={session.sessionHandle}
											expiry={session.expiry}
											timeCreated={session.timeCreated}
											refetchData={userDetail.func.refetchAllData}
										/>
									);
								})}

							{sessionList !== undefined && sessionList.length === 0 && (
								<tr className="session-row empty-row">
									<td>No data</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export type SessionInfo = {
	sessionHandle: string;
	timeCreated: number;
	expiry: number;
};

type UserDetailsSessionListItemProps = SessionInfo & {
	refetchData: () => Promise<void>;
};

const UserDetailsSessionListItem: React.FC<UserDetailsSessionListItemProps> = ({
	sessionHandle,
	timeCreated,
	expiry,
	refetchData,
}: UserDetailsSessionListItemProps) => {
	// Strip session handle to use 9 before and 12 after ellipsis
	let _sessionhandle = sessionHandle;

	const { deleteSessionsForUser } = useSessionsForUserService();

	if (sessionHandle.length > 24) {
		const leading = sessionHandle.substring(0, 9);
		const trailing = sessionHandle.substring(sessionHandle.length - 12);

		_sessionhandle = leading + "..." + trailing;
	}

	const createdDate = getFormattedLongDateWithoutTime(timeCreated);
	const expiresDate = formatLongDate(expiry);

	const revokeSession = async () => {
		await deleteSessionsForUser([sessionHandle]);
		await refetchData();
	};

	return (
		<tr className="session-row with-data">
			<td className="w30 session-id">
				<span>{_sessionhandle}</span>
			</td>
			<td>{createdDate}</td>
			<td>{expiresDate}</td>
			<td>
				<div
					className="button button-error-outline"
					onClick={revokeSession}>
					Revoke
				</div>
			</td>
		</tr>
	);
};
