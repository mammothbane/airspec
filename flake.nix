# vim: ft=nix :
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";

    flake-utils = {
      url = "github:numtide/flake-utils/master";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  description = "airspec";

  outputs = { self, nixpkgs, flake-utils }: (flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };

      py3 = pkgs.python3.withPackages (pypkgs: with pypkgs; [
        influxdb-client
      ]);

    in {
      devShells.default = pkgs.mkShell {
        pname = "airspec devenv";
        version = self.rev or "dirty";

        buildInputs = with pkgs; [
          py3
          influxdb2
        ];
      };
    })
  );
}
