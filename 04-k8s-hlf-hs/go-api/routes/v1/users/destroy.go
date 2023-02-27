package users

import (
	"net/http"

	"github.com/gorilla/mux"

	UsersModel "k8s-hyperledger-fabric-2.2/go-api/models/v1/users"
)

func Destroy() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		vars := mux.Vars(r)
		id := vars["id"]

		if err := UsersModel.Destroy(id); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write([]byte("Success"))
	}
}
