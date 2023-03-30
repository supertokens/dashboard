from typing import Any, Dict

from supertokens_python import InputAppInfo, SupertokensConfig
from supertokens_python.recipe import (dashboard, emailpassword,
                                       emailverification, passwordless,
                                       session, thirdparty, usermetadata)
from supertokens_python.recipe.dashboard.interfaces import RecipeInterface
from supertokens_python.recipe.dashboard.utils import InputOverrideConfig
from supertokens_python.recipe.passwordless import ContactEmailOrPhoneConfig
from supertokens_python.recipe.thirdparty import Google

# this is the location of the SuperTokens core.
supertokens_config = SupertokensConfig(
    connection_uri="http://localhost:3567")


app_info = InputAppInfo(
    app_name="Supertokens",
    api_domain="http://localhost:3001",
    website_domain="http://localhost:3000",
)

framework = "flask"


def override_dashboard_functions(original_implementation: RecipeInterface):
    async def get_dashboard_bundle_location(user_context: Dict[str, Any]) -> str:
        return "http://localhost:3000"

    original_implementation.get_dashboard_bundle_location = get_dashboard_bundle_location
    return original_implementation


# recipeList contains all the modules that you want to
# use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
recipe_list = [
    session.init(),
    dashboard.init(
        api_key="someapikey",
        override=InputOverrideConfig(
            functions=override_dashboard_functions
        )
    ),
    emailpassword.init(),
    thirdparty.init(
        sign_in_and_up_feature=thirdparty.SignInAndUpFeature(providers=[
            Google(
                client_id='1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com',
                client_secret='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'
            ),
        ]),
    ),
    passwordless.init(
        flow_type="USER_INPUT_CODE_AND_MAGIC_LINK",
        contact_config=ContactEmailOrPhoneConfig()
    ),
    emailverification.init(mode="REQUIRED"),
    usermetadata.init(),
]
