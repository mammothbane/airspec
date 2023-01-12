# vim: ft=nix :
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";

    flake-utils = {
      url = "github:numtide/flake-utils/master";
      inputs.nixpkgs.follows = "nixpkgs";
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

      py3 = pkgs.python3.withPackages (pypkgs: with pypkgs; [
        influxdb-client
      ]);

      rust = pkgs.rust-bin.nightly."2023-01-10".default.override {
        extensions = [ "rust-src" ];
      };

    in {
      devShells.default = pkgs.mkShell {
        pname = "airspec devenv";
        version = self.rev or "dirty";

        buildInputs = with pkgs; [
          py3
          influxdb2
          rust
          stdenv.cc
        ];
      };
    })
  );
}
