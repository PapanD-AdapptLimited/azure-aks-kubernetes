package router

import (
	"github.com/gorilla/mux"
	"k8s-hyperledger-fabric-2.2/go-api/models"
)

type Router struct {
	RawRouter *mux.Router
}

func (r Router) GetRawRouter() *mux.Router {
	return r.RawRouter
}

func (r *Router) AttachSubRouterWithMiddleware(path string, subroutes models.Routes, middleware mux.MiddlewareFunc) *mux.Router {

	SubRouter := r.RawRouter.PathPrefix(path).Subrouter()
	SubRouter.Use(middleware)

	for _, route := range subroutes {
		SubRouter.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(route.HandlerFunc)
	}

	return SubRouter
}
