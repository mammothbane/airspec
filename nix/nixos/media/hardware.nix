{
  swapDevices = [
    {
      device = "/dev/disk/by-uuid/7edca544-4c8b-4301-b038-7d0e6fddfcc6";
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

  fileSystems."/" = {
    device = "/dev/disk/by-uuid/990668ec-08af-4b05-9df2-8b64c1de6a18";
    fsType = "ext4";
  };

  virtualisation.vmware.guest.enable = true;
}
