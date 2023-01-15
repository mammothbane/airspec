{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";

    flake-utils = {
      url = "github:numtide/flake-utils/master";
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
        protobuf
        grpcio
        grpcio-tools
      ]);

    in {
      devShells.default = pkgs.mkShell {
        pname = "airspec devenv";
        version = self.rev or "dirty";

        buildInputs = with pkgs; [
          py3

          cmake
          pkgsCross.armhf-embedded.stdenv.cc

          openocd
          stm32cubemx

          protobuf

          qemu
        ];
      };
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
        };
      };

    in {
      airspecs = nixpkgs.lib.nixosSystem (system []);

      airspecs-vm = nixpkgs.lib.nixosSystem (system [
        "${nixpkgs}/nixos/modules/virtualisation/qemu-vm.nix"

        {
          boot.kernelParams = ["console=ttyS0,115200" "console=tty1"];
        }
      ]);
    };
  };
}
