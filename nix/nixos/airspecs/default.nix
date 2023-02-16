{ flake, config, lib, pkgs, modulesPath, ... }: {
  imports = [
    ./nginx.nix
    ./users.nix
    ./influx.nix
    ./image.nix
    ./ingest.nix
    ./secrets.nix
    ./sshguard.nix
  ];

  system.stateVersion = "22.11";

  boot.loader.timeout = 1;
  boot.loader.grub = {
    enable = true;
    version = 2;
    configurationLimit = 2;
  };

  services = {
    xserver.enable = false;

    openssh = {
      enable = true;

      permitRootLogin = lib.mkForce "no";
      openFirewall = true;

      extraConfig = ''
        AllowAgentForwarding  yes
        StreamLocalBindUnlink yes
      '';
    };

    getty = {
      greetingLine = "nixos on \\n (\\l)";
      helpLine = lib.mkForce "";
    };

    tailscale.enable = true;
  };

  security.acme = {
    acceptTerms = true;
    defaults.email = "np@nathanperry.dev";
  };

  networking = {
    useDHCP = true;

    hostName = "airspecs";
    domain = "resenv.org";

    firewall = {
      enable = true;
      checkReversePath = "loose";

      trustedInterfaces = lib.optional config.services.tailscale.enable config.services.tailscale.interfaceName;

      allowedTCPPorts = [
        80
        443
      ];
    };
  };

  console = {
    earlySetup = true;
    keyMap = "us";
  };

  powerManagement.cpuFreqGovernor = "ondemand";

  time.timeZone = "America/New_York";

  programs = {
    zsh.enable = true;
  };

  environment = {
    shells = with pkgs; [
      bashInteractive
      zsh
    ];

    systemPackages = with pkgs; [
      (config.nix.package)

      wget
      vim
      git
      htop
      file
      rsync
      kermit
      picocom

      man

      nixos-rebuild
      nixos-install-tools

      wezterm.terminfo

      flake.packages.x86_64-linux.ingest.passthru.provision_admin
    ];

    etc.issue = lib.mkOverride 75 {
      text = ''
        \n [\l]
      '';
    };

    noXlibs = lib.mkOverride 150 true;
  };

  i18n.defaultLocale = "en_US.UTF-8";

  programs.gnupg.agent = {
    # users should run gpg-agent themselves if they
    # need it.
    enable = lib.mkForce false;
  };

  nixpkgs = {
    config.allowUnfree = true;
  };

  nix = {
    settings = {
      experimental-features = "nix-command flakes";
      allowed-uris = "ssh:// https:// http:// git+ssh://";
      http-connections = 0;
      keep-going = true;
      log-lines = 25;
      narinfo-cache-negative-ttl = 60;
      narinfo-cache-positive-ttl = 60 * 60 * 24 * 7;
      warn-dirty = false;
    };

    gc = {
      automatic = true;
      dates        =   "Sun *-*-* 00:48:52"  ;
    };

    optimise = {
      automatic = true;
      dates  = [ "Sun *-*-* 00:18:03" ];
    };
  };

  security = {
    pam = {
      enableSSHAgentAuth = true;
      enableEcryptfs = true;
    };

    sudo.wheelNeedsPassword = false;
  };

  hardware.enableRedistributableFirmware = true;
  sound.enable = false;
}
