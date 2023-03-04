{
  swapDevices = [
    {
      device = "/swap";
      size = 1536;
    }
  ];

  nix.settings.max-jobs = 1;

  fileSystems."/" = {
    device = "/dev/disk/by-label/nixos";
    fsType = "ext4";
  };

  boot = {
    loader.grub = {
      efiSupport = false;
      devices = [
        "/dev/xvda"
      ];
    };
  };
}
