{
  swapDevices = [
    {
      device = "/swap";
      size = 16 * 1024;
    }
  ];

  nix.settings.max-jobs = 1;

  # filesystems are handled by aws_support.nix, image.nix
}
