import { useContext, useState } from "react";
import { useUserRolesService } from "../../../../../api/userroles/user/roles";
import { PopupContentContext } from "../../../../contexts/PopupContentContext";
import Button from "../../../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../../../dialog";

import { getImageUrl } from "../../../../../utils";
import "./deleteRoles.scss";

export default function DeleteUserRoleDialog({
	closeDialog,
	roleToDelete,
	userId,
	assignedRoles,
	setAssignedRoles,
}: {
	closeDialog: () => void;
	roleToDelete: string;
	userId: string;
	assignedRoles: string[];
	setAssignedRoles: (roles: string[]) => void;
}) {
	const { showToast } = useContext(PopupContentContext);
	const { removeUserRole } = useUserRolesService();
	const [isDeletingRoles, setIsDeletingRoles] = useState(false);

	async function handleDeleteUserRole() {
		setIsDeletingRoles(true);
		try {
			await removeUserRole(userId, roleToDelete);
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
			closeDialog();
		}
	}

	return (
		<Dialog closeDialog={closeDialog}>
			<DialogContent>
				<DialogHeader>Delete Roles?</DialogHeader>
				<p className="you-sure-text">
					Are you sure you want to delete the selected Role: <span className="red">{roleToDelete}</span>? This
					action is irreversible.
				</p>
				<DialogFooter border="border-none">
					<Button
						onClick={closeDialog}
						color="gray-outline">
						Cancel
					</Button>
					<Button
						isLoading={isDeletingRoles}
						onClick={handleDeleteUserRole}
						color="danger">
						Yes, Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
