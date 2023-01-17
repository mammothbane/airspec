{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";

    flake-utils = {
      url = "github:numtide/flake-utils/master";
    };

    rust-overlay = {
      url = "github:oxalica/rust-overlay/master";

      inputs = {
        flake-utils.follows = "flake-utils";
        nixpkgs.follows = "nixpkgs";
      };
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
        ];
      };

      localPackages = pkgs.callPackage ./nix/pkgs {};

      py3 = pkgs.python3.withPackages (pypkgs: with pypkgs; ([
        influxdb-client
        protobuf

        grpcio
        grpcio-tools
      ] ++ (localPackages.docs-site.passthru.pydeps pypkgs)));

      local_rust = pkgs.rust-bin.nightly."2023-01-10".default.override {
        extensions = [ "rust-src" ];
      };

    in {
      packages = localPackages;

      devShells.default = pkgs.mkShell {
        pname = "airspec devenv";
        version = self.rev or "dirty";

        buildInputs = with pkgs; [
          py3
          influxdb2
          local_rust
          stdenv.cc
          pkg-config
          swift

          cmake
          pkgsCross.armhf-embedded.stdenv.cc

          openocd
          stm32cubemx

          protobuf
          nanopb

          qemu
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
