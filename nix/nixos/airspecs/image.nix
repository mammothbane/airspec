{ config, lib, pkgs, nixpkgs, ... }: {
  boot.growPartition = true;

  system.build.image = import "${nixpkgs}/nixos/lib/make-disk-image.nix" {
    inherit config lib pkgs;

    label = "airspecs_rootfs";
    format = "qcow2-compressed";
    installBootLoader = true;
    partitionTableType = "legacy+gpt";
    additionalSpace = "1G";
  };
}
