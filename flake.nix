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
              extensions = [ "rust-src" ];
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

        nativeBuildInputs = with pkgs; with inputs.sops-nix.packages.${system}; [
          py3
          influxdb2
          local_rust
          stdenv.cc
          pkg-config
          swift

          cmake

          openocd
          stm32cubemx

          protobuf
          nanopb

          qemu

          ssh-to-pgp
          sops
          sops-import-keys-hook
        ] ++ localPackages.website.passthru.deps;

        NODE_OPTIONS = "--openssl-legacy-provider";
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
