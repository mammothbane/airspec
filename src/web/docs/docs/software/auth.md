# AuthN / AuthZ

We use an extremely barebones authentication scheme for the API consisting purely of pre-shared cleartext tokens. We
depend upon TLS to ensure security.

There are two types of tokens: admin tokens and user tokens.

## User tokens
These are permitted to submit datapoints to the ingest service and request data dumps by glasses id.

## Admin tokens
These can only create user tokens. They _do not_ have API access to any part of the api tree other than descendants of
`/api/admin`.

## Usage

### Token Generation
Tokens are 32 random bytes encoded as a hex string. You can generate a new user token at
<https://airspecs.media.mit.edu/admin> if you have an admin token.

Admin tokens must be provisioned on the command-line while SSHed into the airspecs box with:

```shell
$ provision_admin new $token_name
```

NB: usage docs available with `provision_admin help`.

### HTTP Requests
HTTP requests must be authenticated with the `Authorization` header using the `Bearer` prefix. The format of the header
should look like:

```text
Authorization: Bearer <your_token>
```

An example authenticated `curl`:

```shell
# fetch data from 5 minutes ago to 1 minute ago for glasses with id $ID
$ curl \
  -H "Authorization: $TOKEN" \
  "https://airspecs.media.mit.edu/dump?id=$ID&start=-5m&end=-1m"
```

## Caveats
This authentication scheme is insecure, fundamentally bad practice, and will not scale. It's acceptable for light and
occasional academic collaboration, but is not robust to malicious actors with any resources to speak of. For instance:

- There are no access controls -- anyone with a token can submit data for any pair of glasses, and download data for any
  pair of glasses for any time range that remains in influx.
- There is no protection against token proliferation -- any leaked token gives everyone in the world who has it access
  to everything until we disable the token.
- Tokens are cleartext everywhere and pre-shared. We should instead use a scheme based on asymmetric keys, where the
  client generates a keypair and the server stores the public key, optionally handing it back to the client as a cert.
- Or even better, we had off the problem to someone else and use OAuth. This however is annoying to integrate through
  the mobile app.

I wrote it this way because, as I mentioned, the present approach is fine for academic collaboration, and because I
didn't want to go through the hassle of setting up an AWS or GCP project with the relevant IAM configuration and oauth
flow. Please replace the present system if there are ever more than a handful of tokens accessing the ingest server at a
time, or if it is published widely in a way that makes it susceptible to attack.
