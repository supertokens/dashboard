import { FC, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { UpdateUserInformationResponse } from "../../../api/user";
import { formatLongDate, getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import {
	EmailVerificationStatus,
	FEATURE_NOT_ENABLED_TEXT,
	UserThirdParty,
	UserWithRecipeId,
} from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import InputField from "../inputField/InputField";
import { LayoutPanel } from "../layout/layoutPanel";
import PhoneDisplay from "../phoneNumber/PhoneNumber";
import { PhoneNumberInput } from "../phoneNumber/PhoneNumberInput";
import TooltipContainer from "../tooltip/tooltip";
import { UserRecipePill } from "../usersListTable/UsersListTable";
import { UserDetailNameField } from "./components/nameField/nameField";
import { UserDetailProps } from "./userDetail";
import { getUserChangePasswordPopupProps } from "./userDetailForm";

type UserDetailInfoGridProps = Pick<
	UserDetailProps,
	"onSendEmailVerificationCallback" | "onUpdateEmailVerificationStatusCallback" | "onChangePasswordCallback"
> & {
	userDetail: UserWithRecipeId;
	refetchData: () => Promise<void>;
	onUpdateCallback: (userId: string, updatedValue: UserWithRecipeId) => Promise<UpdateUserInformationResponse>;
	emailVerificationStatus: EmailVerificationStatus | undefined;
};

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

export const UserDetailProviderBox: FC<{ user: UserThirdParty }> = ({ user }) => {
	const { userId, id } = user.thirdParty;
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
	user: UserWithRecipeId;
	isEditing: boolean;
	emailVerificationStatus: EmailVerificationStatus | undefined;
	setVerificationStatus: (isVerified: boolean) => Promise<void>;
	sendVerification: () => void;
};

export const EmailVerifiedField: FC<EmailVerifiedFieldProps> = (props: EmailVerifiedFieldProps) => {
	const { user, isEditing, setVerificationStatus, sendVerification } = props;
	const { recipeId } = user;

	const isApplicable = isEmailVerificationApplicable(recipeId, user.user.email);

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
	const {
		userDetail,
		onUpdateCallback,
		onSendEmailVerificationCallback,
		onUpdateEmailVerificationStatusCallback,
		onChangePasswordCallback,
		refetchData,
		emailVerificationStatus,
	} = props;
	const [emailErrorFromAPI, setEmailErrorFromAPI] = useState<string | undefined>(undefined);
	const [phoneErrorFromAPI, setPhoneErrorFromAPI] = useState<string | undefined>(undefined);
	const [userState, setUserState] = useState<UserWithRecipeId>({ ...userDetail });
	const { showModal } = useContext(PopupContentContext);
	const { recipeId } = userState;
	const { firstName, lastName, timeJoined, email } = userState.user;
	const [isEditing, setIsEditing] = useState(false);

	const onSave = useCallback(async () => {
		const response = await onUpdateCallback(userDetail.user.id, userState);

		if (response.status === "OK") {
			await refetchData();
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
	}, [onUpdateCallback, userState, userDetail]);

	const updateUserDataState = useCallback((updatedUser: Partial<UserWithRecipeId["user"]>) => {
		setUserState((currentState) => {
			return { ...currentState, user: { ...currentState.user, ...updatedUser } } as UserWithRecipeId;
		});
	}, []);

	useEffect(() => setUserState(userDetail), [userDetail]);

	// validate email if `isEditing=true`
	const emailError = useCallback(() => {
		if (!isEditing) {
			return;
		}

		if (emailErrorFromAPI !== undefined) {
			return emailErrorFromAPI;
		}

		return undefined;
	}, [email, userDetail.user.email, isEditing, emailErrorFromAPI])();

	// validate phone if `isEditing=true`
	const phoneNumber = recipeId === "passwordless" ? userState.user.phoneNumber : undefined;
	const phoneNumberProps = userDetail.recipeId === "passwordless" ? userDetail.user.phoneNumber : undefined;
	const phoneNumberError = useCallback(() => {
		if (!isEditing) {
			return;
		}

		if (phoneErrorFromAPI !== undefined) {
			return phoneErrorFromAPI;
		}

		return undefined;
	}, [phoneNumber, phoneNumberProps, isEditing, phoneErrorFromAPI])();

	const phone = isEditing ? (
		<PhoneNumberInput
			name="phone number"
			value={phoneNumber}
			error={phoneNumberError}
			isRequired={
				// prevent delete phone number if it was a phoneNumber account
				userDetail.recipeId === "passwordless" && userDetail.user.phoneNumber !== undefined
			}
			onChange={(phoneNumber) => {
				updateUserDataState({ phoneNumber });
			}}
		/>
	) : phoneNumber !== undefined ? (
		<PhoneDisplay phone={phoneNumber} />
	) : undefined;

	const emailGridContent =
		isEditing && (recipeId === "emailpassword" || recipeId === "passwordless") ? (
			<InputField
				type="email"
				name="email"
				error={emailError}
				value={email}
				handleChange={({ target: { value } }) => updateUserDataState({ email: value })}
			/>
		) : (
			<>
				<span className="user-detail__provider-box__user-id">
					<CopyText>{email || ""}</CopyText>
				</span>
			</>
		);

	const saveDisabled = emailError !== undefined || phoneNumberError !== undefined;

	const handleCancelSave = useCallback(() => {
		setEmailErrorFromAPI(undefined);
		setPhoneErrorFromAPI(undefined);
		setIsEditing(false);
		setUserState(userDetail);
	}, [userDetail]);

	const handleChangePassword = useCallback(
		async (password?: string) => {
			if (password !== undefined && password !== "") {
				await onChangePasswordCallback(userDetail.user.id, password);
				await refetchData();
			}
		},
		[onChangePasswordCallback, userDetail.user.id]
	);

	const openChangePasswordModal = useCallback(
		() =>
			showModal(
				getUserChangePasswordPopupProps({
					userId: userDetail.user.id,
				})
			),
		[showModal, handleChangePassword]
	);

	return (
		<div className="user-detail__info-grid">
			<LayoutPanel
				header={
					<UserDetailInfoGridHeader
						{...{ onSave, isEditing, user: userDetail, onUpdateCallback }}
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
						label={"Email ID:"}
						body={emailGridContent}
					/>
					<UserDetailInfoGridItem
						label={"Is Email Verified:"}
						body={
							<EmailVerifiedField
								user={userDetail}
								isEditing={isEditing}
								setVerificationStatus={async (isVerified) => {
									await onUpdateEmailVerificationStatusCallback(userDetail.user.id, isVerified);
									await refetchData();
								}}
								sendVerification={() => onSendEmailVerificationCallback(userDetail)}
								emailVerificationStatus={emailVerificationStatus}
							/>
						}
					/>
					<UserDetailInfoGridItem
						label={"Phone Number:"}
						body={recipeId === "passwordless" ? phone : NON_APPLICABLE_TEXT}
					/>
					<UserDetailInfoGridItem
						label={"Password:"}
						body={
							recipeId === "emailpassword" ? (
								<button
									className="flat link"
									onClick={openChangePasswordModal}>
									Change Password
								</button>
							) : (
								NON_APPLICABLE_TEXT
							)
						}
					/>
					<UserDetailInfoGridItem
						label={"Provider | Provider user id:"}
						body={
							recipeId === "thirdparty" ? (
								<UserDetailProviderBox user={userState.user} />
							) : (
								NON_APPLICABLE_TEXT
							)
						}
					/>
					<UserDetailInfoGridItem
						label="Auth Method"
						body={<UserRecipePill user={userDetail} />}
					/>
				</div>
			</LayoutPanel>
		</div>
	);
};

export default UserDetailInfoGrid;
