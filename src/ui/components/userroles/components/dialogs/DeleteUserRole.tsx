import { useContext, useState } from "react";
import { useUserRolesService } from "../../../../../api/userroles/user/roles";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter } from "../../../dialog";

import { getImageUrl } from "../../../../../utils";
import "./deleteRole.scss";

export default function DeleteUserRoleDialog({
	onCloseDialog,
	roleToDelete,
	userId,
	assignedRoles,
	setAssignedRoles,
	currentlySelectedTenantId,
}: {
	onCloseDialog: () => void;
	roleToDelete: string;
	userId: string;
	assignedRoles: string[];
	currentlySelectedTenantId: string;
	setAssignedRoles: (roles: string[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);
	const { removeUserRole } = useUserRolesService();
	const [isDeletingRoles, setIsDeletingRoles] = useState(false);

	async function handleDeleteUserRole() {
		setIsDeletingRoles(true);
		try {
			await removeUserRole(userId, roleToDelete, currentlySelectedTenantId);
			showToast({
				iconImage: getImageUrl("checkmark-green.svg"),
				toastType: "success",
				children: "Role deleted successfully!",
			});
			setAssignedRoles(assignedRoles.filter((role) => role !== roleToDelete));
		} catch (error) {
			showToast({
				iconImage: getImageUrl("form-field-error-icon.svg"),
				toastType: "error",
				children: <>Something went wrong Please try again!</>,
			});
		} finally {
			setIsDeletingRoles(false);
			onCloseDialog();
		}
	}

	return (
		<Dialog
			title="Delete Roles?"
			onCloseDialog={onCloseDialog}>
			<DialogContent>
				<p className="you-sure-text">
					Are you sure you want to delete the selected Role: <span className="red">{roleToDelete}</span>? This
					action is irreversible.
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={onCloseDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						isLoading={isDeletingRoles}
						disabled={isDeletingRoles}
						onClick={handleDeleteUserRole}
						color="danger">
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
