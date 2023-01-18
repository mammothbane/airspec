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
            local_rust = prev.rust-bin.nightly."2023-01-10".default.override {
              extensions = [ "rust-src" "clippy" ];
            };
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

      py3 = pkgs.python3.withPackages (pypkgs: with pypkgs; ([
        influxdb-client
        protobuf

        grpcio
        grpcio-tools
      ] ++ (localPackages.docs-site.passthru.pydeps pypkgs)));

    in {
      packages = localPackages;

      devShells.default = pkgs.mkShell {
        pname = "airspec devenv";
        version = self.rev or "dirty";

        sopsPGPKeyDirs = [
          ./nix/keys/machines
        ];

        sopsPGPKeys = [
          ./nix/keys/mammothbane.asc
        ];

        nativeBuildInputs = with pkgs; with inputs.sops-nix.packages.${system}; with localPackages; [
          nanopb

          sops-import-keys-hook
        ] ++ localPackages.website.passthru.deps;

        packages = with pkgs; with inputs.sops-nix.packages.${system}; with localPackages; [
          py3
          influxdb2
          local_rust
          stdenv.cc
          pkg-config

          cmake

          openocd
          stm32cubemx

          swift
          swift_protobuf
          protobuf
          qemu
          ssh-to-pgp
          sops
        ];

        NODE_OPTIONS = "--openssl-legacy-provider";
        NANOPB_PROTO = "${pkgs.nanopb}/share/nanopb/generator/proto";
        RUST_BACKTRACE = "full";

        shellHook = with pkgs; with localPackages; ''
          mkdir -p .devlinks

          ln -sf ${nanopb}/share/nanopb/generator/proto .devlinks/nanopb
          ln -sf ${local_rust} .devlinks/rust
        '';
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
