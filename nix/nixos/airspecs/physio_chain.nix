{
  pkgs,
  flake,
  ...
}: {
  systemd.services.physio_chain = {
    description = "chatgptree client";

    wantedBy = [ "multi-user.target" ];
    after = [ "network-online.target" ];
    wants = [ "network-online.target" ];

    unitConfig = {
      StartLimitIntervalSec = "3600";
      StartLimitBurst = 5;
    };

    serviceConfig = {
      Type = "exec";

      ExecStart = "${flake.packages.${pkgs.system}.physio_chain}/bin/physio_chain -n 4 -b 0.0.0.0:8234";
      Environment = [
        "OPENAI_API_KEY="
        "OPENAI_ORGANIZATION="
        "APP_SECRET_KEY="
      ];

      DynamicUser = true;

      StandardInput = "null";

      Restart = "always";
      RestartSec = "5s";

      KillMode = "process";
      KillSignal = "SIGINT";

      CacheDirectory = "inadyn";

      TimeoutStopSec = "500ms";

      ProtectSystem = "strict";
      ProtectProc = "noaccess";
      ProtectHome = true;
      ProtectHostname = true;
      ProtectClock = true;
      ProtectKernelTunables = true;
      ProtectKernelModules = true;
      ProtectKernelLogs = true;
      ProtectControlGroups = true;

      PrivateDevices = true;
      PrivateUsers = true;
      PrivateMounts = true;

      RestrictNamespaces = true;
      RestrictRealtime = true;
      RestrictSUIDSGID = true;

      MemoryDenyWriteExecute = true;
      LockPersonality = true;
      NoNewPrivileges = true;
      KeyringMode = "private";

      SystemCallFilter = "@system-service";
      SystemCallErrorNumber = "EPERM";
    };
  };
}
