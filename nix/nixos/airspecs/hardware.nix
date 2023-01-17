{
  fileSystems."/" = {
    device = "/dev/disk/by-label/airspecs_rootfs";
    fsType = "ext4";
  };

  swapDevices = [
    {
      device = "/swap";
      size = 1536;
    }
  ];

  nix.settings.max-jobs = 1;

  boot = {
    loader.grub = {
      efiSupport = false;
      devices = [
        "/dev/sda"
      ];
    };
  };

  virtualisation.vmware.guest.enable = true;
}
