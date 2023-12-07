{
  pkgs,
  flake,
  config,
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

    environment = {
      INFLUX_URL = "https://influx.airspecs.resenv.org";
      INFLUX_ORG = "media-lab";
      INFLUX_BUCKET = "sensor_data_boston";
    };

    serviceConfig = {
      Type = "exec";
      ExecStart = "${flake.packages.${pkgs.system}.physio_chain}/bin/physio_chain -n 4 -b 0.0.0.0:8234 -t 240";

      EnvironmentFile = config.sops.secrets."gptree_env".path;

      DynamicUser = true;

      StandardInput = "null";

      Restart = "always";
      RestartSec = "5s";

      KillMode = "process";
      KillSignal = "SIGINT";

      TimeoutStopSec = "5s";

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
