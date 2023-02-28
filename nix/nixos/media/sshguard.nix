{ ... }: {
  services.sshguard = {
    enable = true;

    services = [
      "sshd"
    ];

    whitelist = [
      "100.64.0.0/10"
      "18.27.0.0/16"
    ];

    blacklist_threshold = 100;
  };
}
