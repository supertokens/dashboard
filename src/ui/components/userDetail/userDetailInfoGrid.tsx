import { FC, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { formatLongDate, getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { useTenantsListContext } from "../../contexts/TenantsListContext";
import { EmailVerificationStatus, FEATURE_NOT_ENABLED_TEXT, User } from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import { LayoutPanel } from "../layout/layoutPanel";
import TooltipContainer from "../tooltip/tooltip";
import { UserDetailNameField } from "./components/nameField/nameField";
import { useUserDetailContext } from "./context/UserDetailContext";
import { UserDetailProps } from "./userDetail";
import { METADATA_NOT_ENABLED_TEXT } from "./userMetaDataSection";

type UserDetailInfoGridProps = Pick<
	UserDetailProps,
	"onSendEmailVerificationCallback" | "onUpdateEmailVerificationStatusCallback" | "onChangePasswordCallback"
>;

type UserDetailInfoGridItemProps = {
	label?: ReactNode;
	body?: ReactNode;
	tooltip?: ReactNode;
};

type UserDetailInfoGridHeaderProps = {
	onSave: () => void;
	onEdit: () => void;
	onCancel: () => void;
	isSaveDisabled: boolean;
	isEditing: boolean;
};

const NON_APPLICABLE_TEXT = "N/A";

export const isEmailVerificationApplicable = (recipeId: string, email: string | undefined) => {
	return email !== undefined;
};

export const NameTooltip: FC<{ fieldName: string }> = ({ fieldName }) => (
	<>
		<p>
			This information is fetched using the <span className="block-snippet-small">{fieldName}</span> key from the
			meta data set for this user.
			<br />
			<br />
			To change this information, please add / change <span className="block-snippet-small">{fieldName}</span> key
			using our usermetadata feature.
		</p>
	</>
);

export const UserDetailProviderBox: FC<{ user: User }> = ({ user }) => {
	const { userId, id } = user.thirdParty[0];
	const useLogoIcon = ["apple", "github", "google", "facebook"].includes(id.toLowerCase());

	return (
		<div className={`user-detail__provider-box block-snippet ${id.toLowerCase()}`}>
			<span>
				{
					// display logo for recognized provider, otherwise displays providerId as text
					useLogoIcon ? (
						<img
							src={getImageUrl(`provider-${id}.svg`)}
							alt={id}
						/>
					) : (
						id
					)
				}
			</span>
			<span>|</span>
			<span className="user-detail__provider-box__user-id">
				<CopyText>{userId}</CopyText>
			</span>
		</div>
	);
};

export const UserDetailInfoGridItem: FC<UserDetailInfoGridItemProps> = ({ label, body, tooltip }) => {
	const tooltipElement =
		tooltip !== undefined ? (
			<TooltipContainer tooltip={tooltip}>
				<span className="user-detail__info-grid__item__guide">
					<img
						src={getImageUrl("help-icon.png")}
						alt={`${label} guideline`}
					/>
				</span>
			</TooltipContainer>
		) : null;

	return (
		<div className="user-detail__info-grid__item">
			<div className="user-detail__info-grid__item__label">
				{label}
				{tooltipElement}
			</div>
			<div
				className="user-detail__info-grid__item__body"
				title={typeof body === "string" ? body : undefined}>
				{body ?? "-"}
			</div>
		</div>
	);
};

export const UserDetailInfoGridHeader: FC<UserDetailInfoGridHeaderProps> = ({
	onSave,
	onEdit,
	onCancel,
	isEditing,
	isSaveDisabled,
}: UserDetailInfoGridHeaderProps) => (
	<>
		<div className="title">User Information</div>
		{isEditing ? (
			<div className="actions">
				<button
					className="button outline small"
					onClick={onCancel}>
					Cancel
				</button>
				<button
					className="button link outline small"
					onClick={onSave}
					disabled={isSaveDisabled}>
					Save
				</button>
			</div>
		) : (
			<button
				className="button flat link small"
				onClick={onEdit}>
				Edit Info
			</button>
		)}
	</>
);

type EmailVerifiedFieldProps = {
	user: User;
	isEditing: boolean;
	emailVerificationStatus: EmailVerificationStatus | undefined;
	setVerificationStatus: (isVerified: boolean) => Promise<void>;
	sendVerification: () => void;
};

export const EmailVerifiedField: FC<EmailVerifiedFieldProps> = (props: EmailVerifiedFieldProps) => {
	const { user, isEditing, setVerificationStatus, sendVerification } = props;

	const isApplicable = isEmailVerificationApplicable(user.loginMethods[0].recipeId, user.emails[0]);

	const setEmailVerificationStatusCallback = async () => {
		await setVerificationStatus(!isVerified);
	};

	if (props.emailVerificationStatus === undefined) {
		return <>Loading...</>;
	}

	const { status } = props.emailVerificationStatus;
	if (status === FEATURE_NOT_ENABLED_TEXT) {
		return <>Feature not enabled</>;
	}

	if (!isApplicable) {
		return <>{NON_APPLICABLE_TEXT}</>;
	}

	const { isVerified } = props.emailVerificationStatus;

	return (
		<>
			{isVerified ? "Yes" : "No"}
			{isEditing && (
				<button
					className="flat link email-verified-button"
					onClick={setEmailVerificationStatusCallback}>
					Set as {isVerified ? "unverified" : "verified"}
				</button>
			)}
			{!isEditing && !isVerified && (
				<button
					className="flat link email-verified-button"
					onClick={sendVerification}>
					Send verification email
				</button>
			)}
		</>
	);
};

export const UserDetailInfoGrid: FC<UserDetailInfoGridProps> = (props) => {
	const { onChangePasswordCallback } = props;
	const { showLoadingOverlay, hideLoadingOverlay, userDetail } = useUserDetailContext();
	const [emailErrorFromAPI, setEmailErrorFromAPI] = useState<string | undefined>(undefined);
	const [phoneErrorFromAPI, setPhoneErrorFromAPI] = useState<string | undefined>(undefined);

	let nameInfo = {};

	if (userDetail.metaData !== undefined && userDetail.metaData !== METADATA_NOT_ENABLED_TEXT) {
		const metaData = JSON.parse(userDetail.metaData);
		const firstName = metaData.first_name;
		const lastName = metaData.last_name;

		if (firstName !== undefined) {
			nameInfo = { ...nameInfo, firstName };
		}

		if (lastName !== undefined) {
			nameInfo = { ...nameInfo, lastName };
		}
	}

	const [userState, setUserState] = useState<User>({
		...userDetail.details,
		...nameInfo,
	});
	const { showModal } = useContext(PopupContentContext);
	const { firstName, lastName, timeJoined, emails, isPrimaryUser } = userState;
	const [isEditing, setIsEditing] = useState(false);
	const { tenantsListFromStore } = useTenantsListContext();

	const onSave = useCallback(async () => {
		showLoadingOverlay();
		const response = await userDetail.func.updateUser(userDetail.userId, userState, tenantsListFromStore);

		if (response.status === "NO_API_CALLED") {
			return;
		}

		if (response.status === "OK") {
			await userDetail.func.refetchAllData();
			setIsEditing(false);
		} else {
			if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
				setEmailErrorFromAPI("A user with this email already exists");
			}

			if (response.status === "INVALID_EMAIL_ERROR") {
				setEmailErrorFromAPI(response.error);
			}

			if (response.status === "PHONE_ALREADY_EXISTS_ERROR") {
				setPhoneErrorFromAPI("A user with this phone number already exists");
			}

			if (response.status === "INVALID_PHONE_ERROR") {
				setPhoneErrorFromAPI(response.error);
			}
		}

		hideLoadingOverlay();
	}, [userDetail, userState, userDetail]);

	const updateUserDataState = useCallback((updatedUser: Partial<User>) => {
		setUserState((currentState) => {
			return { ...currentState, ...updatedUser } as User;
		});
	}, []);

	useEffect(() => setUserState(userDetail.details), [userDetail]);

	const handleCancelSave = useCallback(() => {
		setEmailErrorFromAPI(undefined);
		setPhoneErrorFromAPI(undefined);
		setIsEditing(false);
		setUserState(userDetail.details);
	}, [userDetail]);

	return (
		<div className="user-detail__info-grid">
			<LayoutPanel
				header={
					<UserDetailInfoGridHeader
						{...{ onSave, isEditing, user: userDetail }}
						onEdit={() => setIsEditing(true)}
						onCancel={handleCancelSave}
						isSaveDisabled={false}
					/>
				}>
				<div className="user-detail__info-grid__grid">
					<UserDetailNameField
						fieldName="first_name"
						label="First Name:"
						value={firstName === "" || firstName === undefined ? "-" : firstName}
						isEditing={isEditing}
						onChange={({ target: { value } }) => {
							updateUserDataState({
								firstName: value,
							});
						}}
					/>

					<UserDetailNameField
						fieldName="last_name"
						label="Last Name:"
						value={lastName === "" || lastName === undefined ? "-" : lastName}
						isEditing={isEditing}
						onChange={({ target: { value } }) => {
							updateUserDataState({
								lastName: value,
							});
						}}
					/>
					<UserDetailInfoGridItem
						label={"Signed up on:"}
						body={timeJoined && formatLongDate(timeJoined)}
					/>

					<UserDetailInfoGridItem
						label={"Is Primary User?"}
						body={isPrimaryUser ? "Yes" : "No"}
					/>
				</div>
			</LayoutPanel>
		</div>
	);
};

export default UserDetailInfoGrid;
