# [protobuf](https://protobuf.dev)

## protobuf
>Protocol Buffers are a language-neutral, platform-neutral extensible mechanism
>for serializing structured data.

We use protobuf to define the message format between components in our system.
The message definitions can be found in `/proto/`. Language-specific
code-generators produce struct/class definitions for each message type. Where
possible, this generated code is not committed to source control, but is part
of the build process in each language.
