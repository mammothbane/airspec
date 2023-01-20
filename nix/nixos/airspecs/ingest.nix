{ config, lib, flake, secrets, ... }: {
  systemd.services.airspecs-ingest = {
    description = "airspecs ingest server";

    wantedBy = [
      "multi-user.target"
    ];

    bindsTo = [
      "network-online.target"
    ] ++ lib.optional config.services.influxdb2.enable "influxdb2.service";

    after = [
      "network-online.target"
    ] ++ lib.optional config.services.influxdb2.enable "influxdb2.service";

    unitConfig = {
      StartLimitBurst = 3;
      StartLimitIntervalSec = "1m";
    };

    serviceConfig = {
      Type = "exec";

      # token is passed through environment so it can't be read through /proc
      ExecStart = "${flake.packages.x86_64-linux.ingest}/bin/server -b $BUCKET -o $ORG --bind 127.0.0.1:6666";
      EnvironmentFile = config.sops.secrets."airspecs_server_env".path;

      DynamicUser = true;
      User = "airspecs";
      Group = "airspecs";

      Restart = "always";
      RestartSec = "10s";

      TimeoutStopSec = "10s";

      MemoryHigh = "400M";
      MemoryMax = "800M";

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
