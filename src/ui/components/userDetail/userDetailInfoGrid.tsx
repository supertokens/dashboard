import { FC, ReactNode } from "react";
import { formatLongDate, getImageUrl } from "../../../utils";
import { UserThirdParty, UserWithRecipeId } from "../../pages/usersList/types";
import CopyText from "../copyText/CopyText";
import { LayoutPanel } from "../layout/layoutPanel";
import PhoneDisplay from "../phoneNumber/PhoneNumber";
import TooltipContainer from "../tooltip/tooltip";

type UserDetailInfoGridProps = {
  user: UserWithRecipeId;
  onUpdateCallback?: () => void;
};

type UserDetailInfoGridItemProps = {
  label?: ReactNode;
  body?: ReactNode;
  tooltip?: ReactNode;
};

const NameTooltip: FC<{fieldName: string}> = ({ fieldName }) => <>
  <p className="center">To change this information, please 
    add / change <span className="block-snippet-small">{fieldName}</span> key in the user metadata section below.</p>
  <p className="center">Eg: <span className="block-snippet-small">“{fieldName}”:“Jane”</span></p>
</>

export const UserDetailProviderBox: FC<{user: UserThirdParty }> = ({user}) => { 
  const { userId, id } = user.thirdParty;
  const useLogoIcon = ['apple', 'github', 'google', 'facebook'].includes(id.toLowerCase())
  return <div className={`user-detail__provider-box block-snippet-large ${id.toLowerCase()}`}>
    <span>{ useLogoIcon ? <img src={getImageUrl(`provider-${id}.svg`)} alt={id} /> : id}</span>
    <span>|</span> 
    <span className="user-detail__provider-box__user-id"><CopyText>{userId}</CopyText></span>
  </div>
}


export const UserDetailInfoGridItem: FC<UserDetailInfoGridItemProps> = ({ label, body, tooltip }) => {
  const tooltipElement = tooltip !== undefined ? 
    <TooltipContainer tooltip={tooltip}>
      <span className="user-detail__info-grid__item__guide"><img src={getImageUrl("help-icon.png")} alt={`${label} guideline`} /></span>
    </TooltipContainer> : 
    null;
  return <div className="user-detail__info-grid__item">
    <div className="user-detail__info-grid__item__label">{ label }{ tooltipElement }</div>
    <div className="user-detail__info-grid__item__body" title={ typeof body === "string" ? body : undefined}>{ body ?? "-" }</div>
  </div>
}

export const UserDetailInfoGrid: FC<UserDetailInfoGridProps> = ({ user, onUpdateCallback }) => {
  const nonApplicableText = "N/A";
  const { recipeId } = user;
  const { firstName, lastName, timeJoined, email } = user.user;
  
  const phone = recipeId === 'passwordless' && user.user.phoneNumber !== undefined && user.user.phoneNumber.trim().length > 0 ? 
    <PhoneDisplay phone={user.user.phoneNumber} /> : undefined;
  const header = <>
    <div className="title">User Information</div>
    {onUpdateCallback !== undefined && <div>Edit Info</div>}
  </>

  return <div className="user-detail__info-grid">
    <LayoutPanel header={header}>
      <div className="user-detail__info-grid__grid">
        <UserDetailInfoGridItem 
          label={'First Name:'} 
          body={firstName} 
          tooltip={<NameTooltip fieldName="firstName"/>}/>
        <UserDetailInfoGridItem 
          label={'Last Name:'} 
          body={lastName} 
          tooltip={<NameTooltip fieldName="lastName" />}/>
        <UserDetailInfoGridItem 
          label={'Signed up on:'} 
          body={timeJoined && formatLongDate(timeJoined)}/>
        <UserDetailInfoGridItem label={'Email ID:'} body={email}/>
        <UserDetailInfoGridItem label={'Is Email Verified:'} body={"Yes"}/>
        <UserDetailInfoGridItem 
          label={'Phone Number:'} 
          body={ recipeId === "passwordless" ? phone : nonApplicableText }/>
        <UserDetailInfoGridItem 
          label={'Password:'} 
          body={recipeId === "emailpassword" ? <button className="flat link">Change Password</button> : nonApplicableText}/>
        <UserDetailInfoGridItem 
          label={'Provider | Provider user id:'} 
          body={recipeId === "thirdparty" ? <UserDetailProviderBox user={user.user}/> : nonApplicableText}/>
      </div>
    </LayoutPanel>
  </div>
}

export default UserDetailInfoGrid;