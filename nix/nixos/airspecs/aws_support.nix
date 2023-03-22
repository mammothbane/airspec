{ pkgs, modulesPath, lib, ... }:
{
  imports = [
    "${modulesPath}/virtualisation/amazon-image.nix"
  ];
}