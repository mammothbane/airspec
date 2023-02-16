# Nix

[Nix](https://nixos.org) is a package manager and build system.

We use it to build:

- The server our code is deployed on (`airspecs.resenv.org`)
    - nginx
    - datastore (influxdb)
    - dataviz (grafana)

- The code we write
    - website
    - these docs
    - ingest server

- the development environment

## devenv
Run `nix develop [env]` to drop into a shell with the dependencies for the
given environment. Available `env` values:

- `default`
- `embedded`
- `web`
- `rust`
- `nixos`

You may want to use [`direnv`](https://direnv.net/) to load these environments
automatically when you enter the relevant directories.

It may take a few minutes to download the dependencies the first time, and some
(e.g. the cross-compiler for the firmware) may need to be built from source.

## deploying
To update the server based on what's in the repo, run `nix run .#deploy` from
within the repo.

## fs organization

### `flake.nix`
This file is the root definition for all the nix expressions in this repo. You
can think of it as calling all the other nix files and collecting them in one
place.

When you:

```console
$ nix build .#ingest
```

nix knows what `ingest` is because the flake exposes it in the `packages` output.

### `nix/`

I'm using a convention of organizing nix files under the `nix/` directory --
`flake.nix` only ever imports directly from here.

- `nixos/` has the NixOS system definitions we have in use (currently just
  `airspecs`)
- `pkgs/` has the package definitions. For in-tree packages, the actual
  derivation lives in that package's directory (e.g.
  `src/web/docs/default.nix`) and is reexported here. Out-of-tree packages are
  defined by their own `.nix` file in this directory.
