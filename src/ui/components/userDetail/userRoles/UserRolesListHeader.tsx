import { getImageUrl, getSelectedTenantId } from "../../../../utils";
import Button from "../../button";
import IconButton from "../../common/iconButton";

type UserRolesListHeaderProps = {
	setIsEditing: (value: boolean) => void;
	isEditing: boolean;
	isFeatureEnabled: boolean | undefined;
};

export const UserRolesListHeader = ({ setIsEditing, isEditing, isFeatureEnabled }: UserRolesListHeaderProps) => {
	if (isFeatureEnabled === undefined && isFeatureEnabled === false) {
		return null;
	}

	return (
		<>
			<div>
				<div className="title">Asssigned User Roles</div>
				<span className="subtext">
					All roles assigned to the user for tenant: <span>{getSelectedTenantId()}</span>
				</span>
			</div>
			{!isEditing ? (
				<IconButton
					size="small"
					text="Edit"
					tint="var(--color-link)"
					icon={getImageUrl("edit.svg")}
					onClick={() => {
						setIsEditing(true);
					}}
				/>
			) : (
				<div className="metadata-actions actions">
					<Button
						size="sm"
						color="secondary"
						onClick={() => setIsEditing(false)}>
						Save
					</Button>
				</div>
			)}
		</>
	);
};
