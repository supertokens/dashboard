import { useContext, useEffect, useState } from "react";

import { ReactComponent as GreenCheckIcon } from "../../../../../assets/green-check.svg";
import { ReactComponent as LoaderIcon } from "../../../../../assets/loader.svg";
import { ReactComponent as NoResultsIcon } from "../../../../../assets/no-results.svg";
import { ReactComponent as SecuityKeyIcon } from "../../../../../assets/secuity-key.svg";

import { getImageUrl } from "../../../../../utils";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import InputField from "../../../inputField/InputField";

import { Link } from "react-router-dom";
import useRolesService from "../../../../../api/userroles/role";
import { useUserRolesService } from "../../../../../api/userroles/user/roles";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import "./assignRoles.scss";

export default function AssignRolesDialog({
	onCloseDialog,
	assignedRoles,
	userId,
	setAssignedRoles,
}: {
	onCloseDialog: () => void;
	assignedRoles: string[];
	userId: string;
	setAssignedRoles: (roles: string[]) => void;
}) {
	const { getRoles } = useRolesService();
	const { addRoleToUser } = useUserRolesService();

	const { showToast } = useContext(PopupContentContext);

	const [roles, setRoles] = useState<string[]>([]);
	const [searchText, setSearchText] = useState("");

	const [selectedRolesToAssign, setSelectedRolesToAssign] = useState<string[]>([]);

	const [isLoading, setIsLoading] = useState(false);
	const [isAddingRoles, setIsAddingRoles] = useState(false);

	const rolesNotAssigned = roles.filter((r) => assignedRoles.includes(r) === false);
	const filteredRoles =
		searchText !== ""
			? rolesNotAssigned.filter((role) => role.toLowerCase().includes(searchText))
			: rolesNotAssigned;

	async function assignRoles() {
		if (roles.length < 1) {
			return;
		}
		setIsAddingRoles(true);

		try {
			for (let i = 0; i < selectedRolesToAssign.length; i++) {
				await addRoleToUser(userId, selectedRolesToAssign[i]);
			}

			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children: `${selectedRolesToAssign.length > 1 ? "Roles" : "Role"} assigned successfully!`,
			});

			setAssignedRoles([...assignedRoles, ...selectedRolesToAssign]);
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsAddingRoles(false);
			onCloseDialog();
		}
	}

	const fetchRoles = async () => {
		setIsLoading(true);
		const response = await getRoles();
		if (response !== undefined) {
			if (response.status === "OK" && response.totalPages === undefined) {
				setRoles(response.roles);
			}
		} else {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		}
		setIsLoading(false);
	};

	useEffect(() => {
		void fetchRoles();
	}, []);

	function renderRoles() {
		if (isLoading === true) {
			return (
				<div className="loading-container">
					<LoaderIcon />
				</div>
			);
		}
		if (isLoading === false && roles.length === assignedRoles.length && roles.length > 0) {
			return (
				<div className="info-container">
					<GreenCheckIcon />
					<h1>All User Roles are already assigned!</h1>
					<p>
						<Link to="/roles">Click here</Link> to create more user roles that you require!
					</p>
				</div>
			);
		}

		if (isLoading === false && roles.length < 1) {
			return (
				<div className="info-container">
					<SecuityKeyIcon />
					<h1>You have not created any User Roles</h1>
					<p>
						<Link to="/roles">Click here</Link> to create roles that you can assign to users
					</p>
				</div>
			);
		}

		if (isLoading === false && filteredRoles.length < 1) {
			return (
				<div className="info-container">
					<NoResultsIcon />
					<p className="gray">No Results Found!</p>
				</div>
			);
		}

		return filteredRoles.map((role) => {
			const isChecked = selectedRolesToAssign.includes(role);
			return (
				<div
					data-selected={isChecked ? "true" : "false"}
					key={role}
					className="role-item">
					<span>{role}</span>
					<input
						type="checkbox"
						name={role}
						id={role}
						defaultChecked={isChecked}
						onChange={(e) => {
							if (e.currentTarget.checked === true) {
								setSelectedRolesToAssign([...selectedRolesToAssign, role]);
							} else {
								setSelectedRolesToAssign(selectedRolesToAssign.filter((r) => r === role));
							}
						}}
					/>
				</div>
			);
		});
	}

	return (
		<Dialog
			title="Assign User Roles"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<div className="assign-role-dialog-container">
					<p>Select roles you want to add</p>
					<div className="roles-container">
						<div className="search-box-container">
							<img
								src={getImageUrl("search.png")}
								alt="search icon"
							/>
							<InputField
								disabled={isLoading}
								forceShowError={true}
								name="search-box"
								type="text"
								placeholder="Search"
								hideColon
								handleChange={(e) => {
									setSearchText(e.currentTarget.value.trim().toLowerCase());
								}}
							/>
						</div>
						<div className="roles-header">Roles</div>
						<div className="roles-list-container">{renderRoles()}</div>
					</div>
				</div>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Go Back
					</Button>
					<Button
						disabled={isAddingRoles}
						color={
							selectedRolesToAssign.length > 0 && roles.length !== assignedRoles.length
								? "primary"
								: "gray"
						}
						onClick={assignRoles}
						isLoading={isAddingRoles}>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
