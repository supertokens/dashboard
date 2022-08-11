import express from "express";
import { NextFunction, Request, Response } from "express";
import SuperTokens from "supertokens-node";
import UserMetaData from "supertokens-node/recipe/usermetadata";
import Dashboard from "supertokens-node/lib/build/recipe/dashboard/recipe";
import {
    middleware,
    errorHandler,
} from "supertokens-node/framework/express";
import cors from "cors";
import morgan from "morgan";

const websiteDomain = "http://localhost:3000";

let app = express();
app.use(morgan("[:date[iso]] :url :method :status :response-time ms - :res[content-length]"));

SuperTokens.init({
    framework: "express",
    supertokens: {
        connectionURI: "https://try.supertokens.com",
    },
    appInfo: {
        appName: "Dashboard Dev",
        apiDomain: "http://192.168.29.87:3001",
        websiteDomain,
        apiBasePath: "/auth"
    },
    recipeList: [
        Dashboard.init({
            apiKey: "someapikey",
            override: {
                functions: (original) => {
                    return {
                        ...original,
                        getDashboardBundleBasePath: async function () {
                            return "http://192.168.29.87:3000";
                        },
                    };
                }
            },
        }),
        UserMetaData.init(),
    ],
})

app.use(cors({
    origin: websiteDomain,
    allowedHeaders: ["content-type", ...SuperTokens.getAllCORSHeaders()],
    credentials: true,
}));

app.use(middleware())

app.use(errorHandler());

app.get("/status", (req, res) => {
    res.status(200).send("Started")
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Leaving this in because it helps with debugging
    console.log("Internal error", err);
    res.status(500).send(err.message === undefined ? "Internal server error" : err.message);
})

app.listen(3001, () => {
    console.log("Server started on port 3001")
})
