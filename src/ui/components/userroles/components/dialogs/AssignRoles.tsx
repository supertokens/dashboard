import { useContext, useEffect, useState } from "react";

import { ReactComponent as GreenCheckIcon } from "../../../../../assets/green-check.svg";
import { ReactComponent as LoaderIcon } from "../../../../../assets/loader.svg";
import { ReactComponent as NoResultsIcon } from "../../../../../assets/no-results.svg";
import { ReactComponent as PlusAdd } from "../../../../../assets/plus-square.svg";
import { ReactComponent as SecuityKeyIcon } from "../../../../../assets/roles-and-permissions.svg";

import { getImageUrl } from "../../../../../utils";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";
import InputField from "../../../inputField/InputField";

import { Link } from "react-router-dom";
import useRolesService from "../../../../../api/userroles/role";
import { useUserRolesService } from "../../../../../api/userroles/user/roles";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import AssignRoleConfirmation from "./AssignRoleConfimation";
import "./assignRoles.scss";

export default function AssignRolesDialog({
	onCloseDialog,
	assignedRoles,
	userId,
	setAssignedRoles,
	currentlySelectedTenantId,
}: {
	onCloseDialog: () => void;
	currentlySelectedTenantId: string;
	assignedRoles: string[];
	userId: string;
	setAssignedRoles: (roles: string[]) => void;
}) {
	const { getRoles } = useRolesService();
	const { addRoleToUser } = useUserRolesService();

	const { showToast } = useContext(PopupContentContext);

	//	list of roles fetched from the api
	const [roles, setRoles] = useState<string[] | undefined>(undefined);
	//	searched value
	const [searchText, setSearchText] = useState("");

	//	role that needs to be assigned and boolean to handle api request loading state.
	const [roleToAssign, setRoleToAssign] = useState<string | undefined>(undefined);
	const [isAddingRoles, setIsAddingRoles] = useState(false);

	async function assignRoleToUser(roleName: string) {
		setIsAddingRoles(true);

		try {
			await addRoleToUser(userId, roleName, currentlySelectedTenantId);

			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children: `${roleName} assigned successfully!`,
			});

			setAssignedRoles([...assignedRoles, roleName]);
			setSearchText("");
		} catch (_) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsAddingRoles(false);
			setRoleToAssign(undefined);
		}
	}

	const fetchRoles = async () => {
		const response = await getRoles();
		if (response !== undefined) {
			if (response.status === "OK") {
				setRoles(response.roles);
			}
		} else {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		}
	};

	useEffect(() => {
		void fetchRoles();
	}, []);

	function renderRoles() {
		if (roles === undefined) {
			return (
				<div className="loading-container">
					<LoaderIcon />
				</div>
			);
		}
		if (roles.length === assignedRoles.length && roles.length > 0) {
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

		if (roles.length < 1) {
			return (
				<div className="info-container">
					<SecuityKeyIcon className="security-icon" />
					<h1>You have not created any User Roles</h1>
					<p>
						<Link to="/roles">Click here</Link> to create roles that you can assign to users
					</p>
				</div>
			);
		}

		const rolesNotAssigned = roles.filter((r) => assignedRoles.includes(r) === false);
		const filteredRolesBySearch =
			searchText !== ""
				? rolesNotAssigned?.filter((role) => role.toLowerCase().includes(searchText))
				: rolesNotAssigned;

		if (filteredRolesBySearch.length < 1) {
			return (
				<div className="info-container">
					<NoResultsIcon />
					<p className="gray">No Results Found!</p>
				</div>
			);
		}

		return filteredRolesBySearch.map((role) => {
			return (
				<div
					key={role}
					className="role-item">
					<span>{role}</span>
					<PlusAdd
						className="add-icon"
						onClick={() => setRoleToAssign(role)}
					/>
				</div>
			);
		});
	}

	if (roleToAssign !== undefined) {
		return (
			<AssignRoleConfirmation
				assignRoleToUser={assignRoleToUser}
				isAddingRoles={isAddingRoles}
				onCloseDialog={() => setRoleToAssign(undefined)}
				role={roleToAssign}
			/>
		);
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
								disabled={roles === undefined}
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
					<Button onClick={onCloseDialog}>Done</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
