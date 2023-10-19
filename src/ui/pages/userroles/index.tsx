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

import { useEffect, useState } from "react";
import useRolesService from "../../../api/userroles/role";
import { AppEnvContextProvider } from "../../contexts/AppEnvContext";

import { usePermissionsService } from "../../../api/userroles/role/permissions";
import "./index.scss";

export default function UserRolesList() {
	const { getRoles, createRole, deleteRole } = useRolesService();
	const { addPermissionsToRole, removePermissionsFromRole } = usePermissionsService();

	const [roles, setRoles] = useState<{ role: string; permissions: string[] }[]>([]);

	async function fetchRoles() {
		const response = await getRoles();
		if (response.status === "OK") {
			setRoles(response.roles);
		}
	}

	async function handleCreateRole() {
		const role = document.getElementById("role") as HTMLInputElement;
		const permissions = document.getElementById("permissions") as HTMLInputElement;

		await createRole(role.value, permissions.value.trim() !== "" ? permissions.value.split(",") : []);

		alert("role created!");
	}

	async function handleDeleteRole(role: string) {
		const response = await deleteRole(role);
		alert("role deleted");
	}

	async function handleAddPermissions(role: string, permissionsInputId: string) {
		const permissionsInput = document.getElementById(permissionsInputId) as HTMLInputElement;

		await addPermissionsToRole(role, permissionsInput.value.trim() !== "" ? permissionsInput.value.split(",") : []);

		alert("role updated with permisssions");
	}

	async function handleDeletePermissions(role: string, permission: string) {
		await removePermissionsFromRole(role, [permission]);
		alert("permission removed");
	}

	useEffect(() => {
		void fetchRoles();
	}, []);

	return (
		<AppEnvContextProvider
			connectionURI={
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).connectionURI
			}>
			<section className="userroles-container">
				<div
					style={{
						marginBottom: "35px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "start",
						alignItems: "start",
						gap: "10px",
					}}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "start",
							alignItems: "start",
							gap: "10px",
						}}>
						<label
							style={{ fontSize: "14px" }}
							htmlFor="role">
							Enter role name
						</label>
						<input
							type="text"
							name="role"
							id="role"
							placeholder="admin"
						/>
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "start",
							alignItems: "start",
							gap: "10px",
						}}>
						<label
							style={{ fontSize: "14px" }}
							htmlFor="permissions">
							Enter Permissions seperated with ","
						</label>
						<input
							type="text"
							name="permissions"
							id="permissions"
							placeholder="read,write"
						/>
					</div>

					<button onClick={handleCreateRole}>create role</button>
				</div>
				<div>
					<ul>
						{roles.map(({ permissions, role }) => {
							const permissionsInputId = "add-permissions-" + role;
							return (
								<li
									key={role}
									style={{ marginBottom: "40px" }}>
									{role}:
									<span
										onClick={() => handleDeleteRole(role)}
										style={{ color: "red", marginLeft: "40px", cursor: "pointer" }}>
										delete
									</span>
									<ul style={{ color: "green", marginLeft: "40px", cursor: "pointer" }}>
										{permissions.map((permission) => {
											return (
												<li key={permission}>
													{permission}:{" "}
													<span
														onClick={() => handleDeletePermissions(role, permission)}
														style={{
															fontSize: "10px",
															color: "red",
															marginLeft: "40px",
															cursor: "pointer",
														}}>
														delete
													</span>
												</li>
											);
										})}
										<input
											type="text"
											name={permissionsInputId}
											id={permissionsInputId}
											placeholder="read,write"
										/>
										<button
											onClick={() => handleAddPermissions(role, permissionsInputId)}
											style={{ marginTop: "10px", marginLeft: "5px" }}>
											+ permissions
										</button>
									</ul>
								</li>
							);
						})}
						{roles.length === 0 ? <>No Roles found, please create one</> : null}
					</ul>
				</div>
			</section>
			{/* <Footer
				colorMode="dark"
				horizontalAlignment="center"
				verticalAlignment="center"
			/> */}
		</AppEnvContextProvider>
	);
}
