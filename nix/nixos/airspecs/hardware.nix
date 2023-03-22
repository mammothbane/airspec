{
  swapDevices = [
    {
      device = "/swap";
      size = 1536;
    }
  ];

  nix.settings.max-jobs = 1;

  # filesystems are handled by aws_support.nix, image.nix
}
