# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0

ARG GO_VER=1.17
ARG ALPINE_VER=3.16

FROM golang:${GO_VER}-alpine${ALPINE_VER}

WORKDIR /go/src/github.com/chaincode-external-horus-golang
# WORKDIR /opt/gopath/src/chaincode-external
COPY . .

RUN go get -d -v ./...
RUN go install -v ./...

EXPOSE 9999
CMD ["chaincode-external-horus-golang"]
