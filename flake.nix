# vim: ft=nix :
{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";

    flake-utils = {
      url = "github:numtide/flake-utils/master";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  description = "airspec/captivates";

  outputs = { self, nixpkgs, flake-utils }: (flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
      };

      py3 = pkgs.python3.withPackages (pypkgs: with pypkgs; [
        poetry
      ]);

    in {
      devShells.default = pkgs.mkShell {
        pname = "airspec devenv";
        version = self.rev or "dirty";

        venvDir = "python/.venv";

        buildInputs = with pkgs; [
          python3.pkgs.venvShellHook
          py3

          pkgsCross.armhf-embedded.stdenv.cc
          openocd
          stm32cubemx
        ];
      };
    })
  );
}
