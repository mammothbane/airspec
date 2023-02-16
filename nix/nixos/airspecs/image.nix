{ config, lib, pkgs, nixpkgs, ... }: {
  imports = [
    "${nixpkgs}/nixos/maintainers/scripts/ec2/amazon-image.nix"
  ];

  ec2.hvm = true;
  amazonImage.sizeMB = 4096;

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
