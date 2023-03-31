package main

import (
	"net/http"
	"strings"

	"github.com/supertokens/supertokens-golang/recipe/dashboard"
	"github.com/supertokens/supertokens-golang/recipe/dashboard/dashboardmodels"
	"github.com/supertokens/supertokens-golang/recipe/emailpassword"
	"github.com/supertokens/supertokens-golang/recipe/emailverification"
	"github.com/supertokens/supertokens-golang/recipe/emailverification/evmodels"
	"github.com/supertokens/supertokens-golang/recipe/passwordless"
	"github.com/supertokens/supertokens-golang/recipe/passwordless/plessmodels"
	"github.com/supertokens/supertokens-golang/recipe/session"
	"github.com/supertokens/supertokens-golang/recipe/thirdparty"
	"github.com/supertokens/supertokens-golang/recipe/thirdparty/tpmodels"
	"github.com/supertokens/supertokens-golang/recipe/usermetadata"
	"github.com/supertokens/supertokens-golang/supertokens"
)

func main() {
	err := supertokens.Init(supertokens.TypeInput{
		Supertokens: &supertokens.ConnectionInfo{
			ConnectionURI: "localhost:3567",
		},
		AppInfo: supertokens.AppInfo{
			AppName:       "Dashboard Dev Go",
			WebsiteDomain: "localhost:3000",
			APIDomain:     "localhost:3001",
		},
		RecipeList: []supertokens.Recipe{
			dashboard.Init(&dashboardmodels.TypeInput{
				ApiKey: "someapikey",
				Override: &dashboardmodels.OverrideStruct{
					Functions: func(originalImplementation dashboardmodels.RecipeInterface) dashboardmodels.RecipeInterface {
						getDashboardBundleLocation := func(userContext supertokens.UserContext) (string, error) {
							return "http://localhost:3000", nil
						}
						*originalImplementation.GetDashboardBundleLocation = getDashboardBundleLocation
						return originalImplementation
					},
				},
			}),
			usermetadata.Init(nil),
			session.Init(nil),
			emailpassword.Init(nil),
			thirdparty.Init(&tpmodels.TypeInput{
				SignInAndUpFeature: tpmodels.TypeInputSignInAndUp{
					Providers: []tpmodels.TypeProvider{
						thirdparty.Google(tpmodels.GoogleConfig{
							ClientID:     "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
							ClientSecret: "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",
						}),
					},
				},
			}),
			passwordless.Init(plessmodels.TypeInput{
				ContactMethodEmailOrPhone: plessmodels.ContactMethodEmailOrPhoneConfig{
					Enabled: true,
				},
				FlowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
			}),
			emailverification.Init(evmodels.TypeInput{
				Mode: evmodels.ModeRequired,
			}),
		},
	})
	if err != nil {
		panic(err)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Started"))
	})

	http.ListenAndServe(":3001", corsMiddleware(supertokens.Middleware(mux)))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, r *http.Request) {
		response.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		response.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == "OPTIONS" {
			// we add content-type + other headers used by SuperTokens
			response.Header().Set("Access-Control-Allow-Headers",
				strings.Join(append([]string{"Content-Type"},
					supertokens.GetAllCORSHeaders()...), ","))
			response.Header().Set("Access-Control-Allow-Methods", "*")
			response.Write([]byte(""))
		} else {
			next.ServeHTTP(response, r)
		}
	})
}
