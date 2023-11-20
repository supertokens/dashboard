import { useContext, useEffect, useState } from "react";
import { usePermissionsService } from "../../../../api/userroles/role/permissions";
import { getImageUrl } from "../../../../utils";
import { PopupContentContext } from "../../../contexts/PopupContentContext";
import { RoleWithOrWithoutPermissions } from "../../../pages/userroles";
import Badge from "../../badge";
import Button from "../../button";
import Shimmer from "../../shimmer";
import { TableCell, TableRow } from "../../table";
import { SetRoles } from "./RolesTable";
import DeleteRoleDialog from "./dialogs/DeleteRole";
import EditRoleDialog from "./dialogs/EditRole";

import { ReactComponent as RefreshIcon } from "../../../../assets/refresh.svg";
import { ReactComponent as TrashIcon } from "../../../../assets/trash.svg";

type RolesTableRowProps = {
	permissions: string[] | undefined;
	role: string;
	roles: RoleWithOrWithoutPermissions[];
	setRoles: SetRoles;
};

export default function RolesTableRow({ permissions, role, roles, setRoles }: RolesTableRowProps) {
	const { showToast } = useContext(PopupContentContext);
	//	used to control opening and closing dialog
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	//	fetchPermissions network states
	const [isErrorWhileFetchingPermissions, setIsErrorWhileFetchingPermissions] = useState(false);
	const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);

	//	to determine how many permissions fits into the row for given screen width.
	const [badgeRenderLimit, setBadgeRenderLimit] = useState(4);
	const { getPermissionsForRole } = usePermissionsService();

	async function fetchPermissionsForRoles() {
		//	only fetch permissions when the permissions are undefined for a give role
		if (permissions === undefined) {
			try {
				setIsFetchingPermissions(true);
				setIsErrorWhileFetchingPermissions(false);
				const response = await getPermissionsForRole(role);
				if (response?.status === "OK") {
					if (roles !== undefined) {
						const updatedRoleWithPermissions = roles.map((r) => {
							if (r.role === role) {
								r.permissions = response.permissions;
							}
							return r;
						});
						setRoles(updatedRoleWithPermissions);
					}
				} else if (response?.status === "UNKNOWN_ROLE_ERROR") {
					showToast({
						iconImage: getImageUrl("form-field-error-icon.svg"),
						toastType: "error",
						children: <>This role does not exists!</>,
					});
				}
			} catch (_) {
				showToast({
					iconImage: getImageUrl("form-field-error-icon.svg"),
					toastType: "error",
					children: <>Something went wrong Please try again!</>,
				});
				setIsErrorWhileFetchingPermissions(true);
			} finally {
				setIsFetchingPermissions(false);
			}
		}
	}

	useEffect(() => {
		function handleResizeEvent() {
			const matchesTablet = window.matchMedia("(min-width: 768px)");
			const matchesMobile = window.matchMedia("(min-width: 568px)");

			if (matchesMobile.matches === false) {
				setBadgeRenderLimit(1);
			} else if (matchesTablet.matches === false) {
				setBadgeRenderLimit(2);
			} else {
				setBadgeRenderLimit(4);
			}
		}

		window.addEventListener("resize", handleResizeEvent);
		void fetchPermissionsForRoles();
		() => {
			//	cleanup
			window.removeEventListener("resize", handleResizeEvent);
		};
	}, []);

	function renderPermissions() {
		//	if api failed to fetch permissions for a given role
		if (isErrorWhileFetchingPermissions) {
			return (
				<div style={{ color: "#ED344E" }}>
					<img
						src={getImageUrl("form-field-error-icon.svg")}
						alt="alert icon"
					/>{" "}
					Something went wrong!
				</div>
			);
		}

		//	while api request to fetch permissions for a role is still in progress.
		if (isFetchingPermissions) {
			return <Shimmer />;
		}

		return (
			<>
				{permissions !== undefined ? (
					<div
						id="permissions"
						className="permissions">
						{permissions.slice(0, badgeRenderLimit).map((permission) => {
							return (
								<Badge
									className="badge-width"
									key={permission}
									text={permission}
								/>
							);
						})}
						{badgeRenderLimit < permissions.length ? (
							<Button
								size="sm"
								color="info">
								...
							</Button>
						) : null}
						{permissions.length < 1 ? (
							<Button
								color="info"
								size="xs">
								No Permissions
							</Button>
						) : null}
					</div>
				) : null}
			</>
		);
	}

	return (
		<>
			<TableRow
				className={isFetchingPermissions ? "disable-row" : undefined}
				key={role}
				onClick={() => {
					setShowEditDialog(true);
				}}>
				<TableCell>{role}</TableCell>
				<TableCell>
					<div className="permissions-container">
						{renderPermissions()}
						{isErrorWhileFetchingPermissions ? (
							<button
								className="refresh-btn"
								onClick={(e) => {
									e.stopPropagation();
									void fetchPermissionsForRoles();
								}}>
								<RefreshIcon />
							</button>
						) : (
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowDeleteDialog(true);
								}}
								className="delete-role">
								<TrashIcon />
							</button>
						)}
					</div>
				</TableCell>
			</TableRow>
			{showDeleteDialog ? (
				<DeleteRoleDialog
					deleteRole={(role: string) => {
						const filteredRoles = roles.filter((r) => r.role !== role);
						setRoles(filteredRoles);
					}}
					onCloseDialog={() => setShowDeleteDialog(false)}
					currentlySelectedRoleName={role}
				/>
			) : null}
			{showEditDialog && permissions !== undefined ? (
				<EditRoleDialog
					roles={roles}
					setRoles={setRoles}
					currentlySelectedRole={{
						role,
						permissions,
					}}
					onCloseDialog={() => {
						setShowEditDialog(false);
					}}
				/>
			) : null}
		</>
	);
}
