package main

import (
	"net/http"
	"strings"

	"github.com/supertokens/supertokens-golang/recipe/dashboard"
	"github.com/supertokens/supertokens-golang/recipe/dashboard/dashboardmodels"
	"github.com/supertokens/supertokens-golang/recipe/usermetadata"
	"github.com/supertokens/supertokens-golang/supertokens"
)

func main() {
	err := supertokens.Init(supertokens.TypeInput{
		Supertokens: &supertokens.ConnectionInfo{
			ConnectionURI: "https://try.supertokens.com",
		},
		AppInfo: supertokens.AppInfo{
			AppName:       "Dashboard Dev",
			WebsiteDomain: "localhost:3000",
			APIDomain:     "localhost:3001",
		},
		RecipeList: []supertokens.Recipe{
			dashboard.Init(dashboardmodels.TypeInput{
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