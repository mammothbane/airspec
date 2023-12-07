{ pkgs, lib, config, ... }: let
  mod_name = "physio_chain_override";
  override_dir = "/var/lib/${mod_name}";
  group_name = mod_name;

  updaterScript = null;

  cfg = config.services.physio_chain_override;

in {
  options = {
    services.physio_chain_override = with lib; with types; {
      enable = mkEnableOption "physio_chain override with deployer script";
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.paths.${mod_name} = {
      description = "monitor physio_chain override dir";

      wantedBy = [ "multi-user.target" ];

      before = [
        "${mod_name}.service"
      ];

      onSuccess = [
        "${mod_name}.service"
      ];

      onFailure = [
        "physio_chain.service"
      ];

      pathConfig = {
        DirectoryNotEmpty = override_dir;
      };
    };

    systemd.services.${mod_name} = {
      description = "chatgptree client (stateful override)";

      wantedBy = [ "multi-user.target" ];

      after = [ 
        "network-online.target" 
        "physio_chain.service"
      ];

      wants = [ "network-online.target" ];

      conflicts = [
        "physio_chain.service"
      ];

      unitConfig = {
        ConditionDirectoryNotEmpty = "|${override_dir}";

        StartLimitIntervalSec = "3600";
        StartLimitBurst = 5;
      };

      serviceConfig = {
        Type = "exec";

        ExecStartPre = "${pkgs.poetry}/bin/poetry install";
        ExecStart = "${pkgs.poetry}/bin/poetry run ${pkgs.python3Packages.gunicorn}/bin/gunicorn -n 4 -b 0.0.0.0:8234 -t 240 --pythonpath ${override_dir}/flaskWebsite app:app";

        WorkingDirectory = override_dir;

        EnvironmentFile = config.sops.secrets."gptree_env".path;

        DynamicUser = true;
        SupplementaryGroups = [
          group_name
        ];

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

    systemd.tmpfiles.settings.${mod_name}.${override_dir}.D = {
      user = "nobody";
      group = group_name;

      mode = "0770";
    };

    users.groups.${group_name} = {};
  };
}
