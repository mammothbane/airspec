# [protobuf](https://protobuf.dev) / [grpc](https://grpc.io/)


## protobuf
>Protocol Buffers are a language-neutral, platform-neutral extensible mechanism
>for serializing structured data.

We use protobuf to define the message format between components in our system.
The message definitions can be found in `proto/`. Language-specific
code-generators produce struct/class definitions for each message type. Where
possible, this generated code is not committed to source control, but is part
of the build process in each language.


## grpc

>gRPC is a modern open source high performance Remote Procedure Call (RPC)
>framework that can run in any environment.

gRPC uses protobuf to provide this RPC framework, so the protos we've already
defined can be used in the RPC definitions. Presently, these are found at
`proto/svc/`.

