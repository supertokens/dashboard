## Summary of change

### Problem Statement

(A few sentences about why this change is being made)

### Summary of solution

(Overview of how the problem is solved by this PR)

## Related issues

-   Link to issue1 here
-   Link to issue1 here

## Test Plan

### Tested on all primary browsers for:

-   Chrome
    -   [ ] Desktop
    -   [ ] Mobile
    -   [ ] Tablet
-   Safari
    -   [ ] Desktop
    -   [ ] Mobile
    -   [ ] Tablet
-   Firefox
    -   [ ] Desktop
    -   [ ] Mobile
    -   [ ] Tablet
-   (Optional) Tested on Safari 12 (Physical or emulator)
    -   [ ] iPad
    -   [ ] iPhone
-   (Optional) Tested on physical mobile and tablet device for:
    -   [ ] Android
    -   [ ] iOS (including iPadOS)

### Feature tests:

-   [ ] Dashboard Admin access.

    -   [ ] Test all the `POST`, `PUT` and `DELETE` endpoints with admins only access enabled for the dashboard recipe.
    -   [ ] Test all `POST`, `PUT` and `DELETE` endpoints without the admins only access enabled.

-   [ ] Search
    -   [ ] Search with anything that results in an empty state in the UI (Should show an empty state explaining that there were no results)
    -   [ ] Search with an empty string (Dashboard should not allow this)
    -   [ ] Email search
        -   [ ] Serach for "e" with email tag and then delete the tag (Should show one user initially then show all with pagination enabled)
        -   [ ] Search for "test" with the email tag (Expect 14 results)
        -   [ ] Search with "g" for email tag (Expect 3 results)
        -   [ ] Search with "g" and "p" for email tag (Expect 3 results)
        -   [ ] Search with "g" and "t" for email tag, then delete "t" (Expect 17 results initially, then 3)
        -   [ ] Search with "@" for email tag (Expect 0 results (This is because at the time of adding this case we would only check for the start of the email or the domain and not any character inside the full email))
        -   [ ] Search for "passwordless+ABC@gmail.com" with email tag (Expect 1 result)
        -   [ ] Search for "debugging@supertokens.com" with email tag (Expect 3 results)
        -   [ ] Search for "gmail" with email tag (Expect 3 results)
        -   [ ] Search for "ABC" with email tag (Expect 0 results)
        -   [ ] Search for "a" with email tag (Expect 0 results (This is because at the time of adding this we only check if the email starts with the query and not contains))
        -   [ ] Search for "team" with email tag (Expect 0 results)
        -   [ ] Search for "782" with email tag (Expect 1 result)
    -   [ ] Phone search
        -   [ ] Search for "1" with phone tag (Expect 3 results)
        -   [ ] Search for "+1" with phone tag (Expect 3 results)
        -   [ ] Search for "91" with phone tag (Expect 1 result)
        -   [ ] Search for "291" with phone tag (Expect 0 results)
        -   [ ] Search for "+12" with phone tag (Expect 2 results)
        -   [ ] Search for "5" with phone tag (Expect 0 results)
        -   [ ] Search for "1(" with phone tag (Expect 0 results (This is because we render phone numbers with brackets so users may end up searching with that))
    -   [ ] Provider search
        -   [ ] Search for "g" with provider tag (Expect 5 results)
        -   [ ] Search for "gi" with provider tag (Expect 2 results)
        -   [ ] Search for "t" with provider tag (Expect 0 results)
        -   [ ] Search for "google" with provider tag (Expect 3 results)
    -   [ ] Combination testing
        -   [ ] Search with "g" for email tag and "g" for provider tag (Expect 1 result)
        -   [ ] Search for "github" with provider tag and "782" with email tag (Expect 1 result)
        -   [ ] Search for "github" and "google" with provider tag (Expect 5 results)
        -   [ ] Search for "j" and "g" with email tag (Expect 6 results)
        -   [ ] Search for "1" and "91" with phone tag (Expect 4 results)
        -   [ ] Search with "google" for provider tag and "1" for phone tag (Expect 0 results)
        -   [ ] Search for "g" with email tag and "1" with phone tag (Expect 0 results)
        -   [ ] Search for "k" with provider and "a", "g", "b" (in that order) for email (Expect 0 resutls)
-   [ ] General UI testing
    -   [ ] Test that emty state renders fine (no overflow, no UI glitches, responsiveness etc)
    -   [ ] Test that the list renders fine (no overflow, no UI glitches, responsiveness etc)
    -   [ ] Test that pagination is visiable and usable (There should be at least 2 pages worth of users)
    -   [ ] Test that the list only shows 10 users at a time
    -   [ ] Test that for users with no accounts linked the auth method i nthe list is correct
    -   [ ] Test that for users with multiple login methods, the auth method shows correctly
    -   [ ] Test that search is visible if the feature is enabled
-   [ ] Multi tenant testing
    -   [ ] Create one tenant (tenant1), and add 3 users to them. In the dashboard, when you switch to that tenant, it should list those users.
    -   [ ] Create a user in tenant1 and using backend sdk's(Go, Python, Node) associate the user to a different tenant and select that tenant on the dashboard from the tenants dropdown, it should show that user in the list
-   [ ] User Roles and Permissions testing

    -   [ ] UserRoles page testing
        -   [ ] Test the empty state when there are no roles created on the roles page.
        -   [ ] Test creation, delete and updating functionality of the roles are working properly.
        -   [ ] Test pagination of the roles list with more than 2 or 3 pages of data atleast.
        -   [ ] Test that the permissions per role are rendering properly without overflowing the parent table.
        -   [ ] Check for the `feature_not_enabled` state on both userDetails page and user roles page.
    -   [ ] userDetails page testing with respect to roles and permissions.
        -   [ ] Test adding and deleting roles to a user.
        -   [ ] Test the roles search feature and make sure that the list does not include any assigned roles in it.
        -   [ ] Test by associating the user with multiple tenants and assigning roles to the user in each tenant separately.

-   [ ] User creation
    -   [ ] Test without initializing any recipes on the backend SDK and ensure that the UI responds with correct alert errors.
    -   [ ] Ensure the relevant warning message is shown while switching between authentication methods.
    -   [ ] EmailPassword user creation.
        -   [ ] Test EmailPassword user creation by enabling both `emailpassword` and `thirdpartyemailpassword` together and individually.
        -   [ ] Test with custom form field validators; make sure that the overrides are working properly.
        -   [ ] Test default email and password validations to ensure they are working properly.
        -   [ ] Test that no duplicate users are created with the same email address.
    -   [ ] Passwordless user creation.
        -   [ ] Test Passwordless user creation by enabling both `passwordless` and `thirdpartypasswordless` together and individually.
        -   [ ] Test creating a user with different `contactMethod`'s ensure that the frontend displays relevant UI based on the `contactMethod` selected.
        -   [ ] Test default email and phoneNumber validations to ensure they are working properly.
        -   [ ] Test user-defined custom email and phoneNumber validators to ensure they are working properly.
    -   [ ] Test AccountLinking by creating an `emailpassword` and `passwordless` user with the same email and make sure that the accounts are linked.
-   [ ] User details
    -   [ ] Can edit email of non third party login method if there is only 1 login method for the user
    -   [ ] Can edit email of non third party login method if there are >= 2 login methods for the user
    -   [ ] Deleting a non primary login method for a user only deletes that login method, and not the whole user
    -   [ ] Deleting a primary login method for a user deletes only that primary login method and not the user
    -   [ ] Deleting a user deletes all the login methods for that user as well

## Documentation changes

(If relevant, please create a PR in our [docs repo](https://github.com/supertokens/docs), or create a checklist here highlighting the necessary changes)

## Checklist for important updates

-   [ ] Changelog has been updated
-   [ ] Changes to the version if needed
    -   In `package.json`
    -   In `package-lock.json`
    -   In `src/version.ts`
-   [ ] Had run `npm run build`
-   [ ] Had installed and ran the pre-commit hook

## Remaining TODOs for this PR

-   [ ] Item1
-   [ ] Item2
