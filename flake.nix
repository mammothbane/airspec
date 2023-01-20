{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";

    flake-utils = {
      url = "github:numtide/flake-utils/master";
    };

    rust-overlay = {
      url = "github:oxalica/rust-overlay/master";

      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };

    crane = {
      url = "github:ipetkov/crane";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
        rust-overlay.follows = "rust-overlay";
      };
    };

    naersk = {
      url = "github:nix-community/naersk";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    sops-nix = {
      url = github:Mic92/sops-nix;
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  description = "airspec";

  outputs = { self, nixpkgs, flake-utils, ... } @ inputs: (flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
        overlays = [
          (import inputs.rust-overlay)
          (final: prev: let
            local_rust = prev.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
          in {
            inherit local_rust;
            crane-lib = (inputs.crane.mkLib final).overrideToolchain local_rust;
            naersk = prev.callPackage inputs.naersk {
              cargo = local_rust;
              rustc = local_rust;
            };
          })
        ];
      };

      localPackages = pkgs.callPackage ./nix/pkgs {};

      nanopb_proto = "${pkgs.nanopb}/share/nanopb/generator/proto";

    in {
      packages = localPackages;

      apps.deploy = let
        deploy = pkgs.writeShellScriptBin "deploy" ''
          set -euo pipefail

          echo 'building server'
          nix build \
            -L \
            --keep-going \
            --no-link \
            $(git rev-parse --show-toplevel)#nixosConfigurations.airspecs.config.system.build.toplevel

          echo 'deploying to chwalek@airspecs.media.mit.edu'
          sudo ${pkgs.nixos-rebuild}/bin/nixos-rebuild \
            --flake $(git rev-parse --show-toplevel)#airspecs \
            --target-host chwalek@airspecs.media.mit.edu \
            switch
        '';

      in {
        type = "app";
        program = "${deploy}/bin/deploy";
      };

      devShells = let
        common = {
          version = self.rev or "dirty";
        };

      in {
        default = pkgs.mkShell (common // {
          pname = "airspec devenv";

          sopsPGPKeyDirs = [
            ./nix/keys/machines
          ];

          sopsPGPKeys = [
            ./nix/keys/mammothbane.asc
          ];

          nativeBuildInputs = with pkgs; with inputs.sops-nix.packages.${system}; with localPackages; [
            sops-import-keys-hook
          ];

          packages = with pkgs; with inputs.sops-nix.packages.${system}; with localPackages; let
            py3 = python3.withPackages (pypkgs: with pypkgs; ([
              influxdb-client
              protobuf
              grpcio
              grpcio-tools
            ] ++ (localPackages.docs-site.passthru.pydeps pypkgs)));
          in [
            py3

            ssh-to-pgp
            sops
          ] ++ (pkgs.lib.optionals pkgs.hostPlatform.isLinux [
            swift
            swift_protobuf
          ]);

          NANOPB_PROTO = nanopb_proto;
          NANOPB_CMAKE_MODULE = "${pkgs.nanopb.src}/extra";

          shellHook = with pkgs; with localPackages; ''
            readonly ROOT=$(git rev-parse --show-toplevel)

            mkdir -p $ROOT/.devlinks

            rm -f $ROOT/.devlinks/nanopb
            rm -f $ROOT/.devlinks/rust

            ln -sf ${nanopb_proto} $ROOT/.devlinks/nanopb
            ln -sf ${local_rust} $ROOT/.devlinks/rust

            cat <<'EOF' >$ROOT/.devlinks/rust.env
            PROTOC=${protobuf}/bin/protoc
            NANOPB_PROTO=${nanopb_proto}
            EOF
          '';
        });

        embedded = pkgs.mkShell (common // {
          pname = "airspec-devenv-embedded";

          packages = with pkgs; [
            openocd
            stm32cubemx

            cmake
            pkg-config
            protobuf

            pkgsCross.armhf-embedded.stdenv.cc
          ];
        });

        nixos = pkgs.mkShell (common // {
          pname = "airspec-devenv-nixos";

          packages = with pkgs; [
            qemu
          ];
        });

        rust = pkgs.mkShell (common // {
          pname = "airspec-devenv-rust";

          RUST_BACKTRACE = "1";

          packages = with pkgs; [
            local_rust
            protobuf
            grpcurl
            influxdb2
          ];
        });

        web = pkgs.mkShell (common // {
          pname = "airspec-devenv-web";

          NODE_OPTIONS = "--openssl-legacy-provider";

          packages = with pkgs; [
            protobuf
            grpcurl
          ] ++ localPackages.website.passthru.deps;
        });
      };

      legacyPackages = pkgs // localPackages;
    })
  ) // {
    nixosConfigurations = let
      system = modules: {
        system = "x86_64-linux";

        modules = [
          inputs.sops-nix.nixosModules.sops

          ./nix/nixos/airspecs
          ./nix/nixos/airspecs/hardware.nix
        ] ++ modules;

        specialArgs = {
          inherit nixpkgs;
          flake = self;
        };
      };

    in {
      airspecs = nixpkgs.lib.nixosSystem (system []);
    };
  };
}
