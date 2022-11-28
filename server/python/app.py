import os

from flask import Flask, abort, g, jsonify
from flask_cors import CORS
from supertokens_python import (
    get_all_cors_headers,
    init,
)
from supertokens_python.framework.flask import Middleware
from supertokens_python.recipe.session.framework.flask import verify_session
import config

init(
    supertokens_config=config.supertokens_config,
    app_info=config.app_info,
    framework=config.framework,
    recipe_list=config.recipe_list,
)

app = Flask(__name__)

Middleware(app)
CORS(
    app=app,
    supports_credentials=True,
    origins="http://localhost:3000",
    allow_headers=["Content-Type"] + get_all_cors_headers(),
)


@app.route("/sessioninfo", methods=["GET"])  # type: ignore
@verify_session()
def get_session_info():
    session_ = g.supertokens
    return jsonify(
        {
            "sessionHandle": session_.get_handle(),
            "userId": session_.get_user_id(),
            "accessTokenPayload": session_.get_access_token_payload(),
        }
    )


# This is required since if this is not there, then OPTIONS requests for
# the APIs exposed by the supertokens' Middleware will return a 404
@app.route("/", defaults={"u_path": ""})  # type: ignore
@app.route("/<path:u_path>")  # type: ignore
def catch_all(u_path: str):  # pylint: disable=unused-argument
    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int("3001"), debug=True)
