{ pkgs, lib, config, ... }: let
  mod_name = "physio_chain_override";
  override_dir = "/var/lib/${mod_name}";
  group_name = "physio_shared";

  updaterScript = pkgs.writers.writePython3Bin "update-gptree" {
    libraries = with pkgs.python3Packages; with pkgs; [
    ];
  } ''
    import sys
    import tarfile
    import tempfile
    import shutil
    import io
    import os
    import shlex
    import subprocess
    
    from pathlib import Path


    REQUIRED_PATHS = [
        'pyproject.toml',
        'poetry.lock',
        'flaskWebsite',
    ]

    START_CMD = 'sudo /run/current-system/sw/bin/systemctl ' + \
      'start ${mod_name}.path'

    RESET_FAILED_CMD = 'sudo /run/current-system/sw/bin/systemctl ' + \
      'reset-failed ${mod_name}.service'

    STOP_CMD = 'sudo /run/current-system/sw/bin/systemctl ' + \
      'stop ${mod_name}.service ${mod_name}.path'

    print('stopping running service')

    subprocess.run(
      shlex.split(STOP_CMD),
      check=True,
    )

    b = io.BytesIO(sys.stdin.buffer.read())
    f = tarfile.open(fileobj=b)

    with tempfile.TemporaryDirectory() as tmpdir, \
         tempfile.TemporaryDirectory() as olddir:
        f.extractall(tmpdir)

        p = Path(tmpdir)

        ok = True
        for path in REQUIRED_PATHS:
            if not (p / path).exists():
                print(f'error: missing required file {path}', file=sys.stderr)
                ok = False

        if not ok:
            sys.exit(1)

        old_dir = Path(olddir)
        existing_dir = Path('${override_dir}')

        print('removing existing files')

        for parent, dirs, files in os.walk(existing_dir):
            for file in files:
                fpath = Path(parent) / file

                rel = fpath.relative_to(existing_dir)
                target = old_dir / rel

                target.parent.mkdir(exist_ok=True)

                shutil.move(fpath, target)

        print('copying new files')

        for parent, dirs, files in os.walk(p):
            for file in files:
                fpath = Path(parent) / file

                rel = fpath.relative_to(p)
                target = existing_dir / rel

                target.parent.mkdir(exist_ok=True)

                shutil.move(fpath, target)

    print('starting service')

    subprocess.run(
      shlex.split(RESET_FAILED_CMD),
      check=True,
    )

    subprocess.run(
      shlex.split(START_CMD),
      check=True,
    )
  '';

  cfg = config.services.physio_chain_override;

in {
  options = {
    services.physio_chain_override = with lib; with types; {
      enable = mkEnableOption "physio_chain override with deployer script";
    };
  };

  config = lib.mkIf cfg.enable {
    environment.systemPackages = [
      updaterScript
    ];

    systemd.paths.${mod_name} = {
      description = "monitor physio_chain_override dir";

      wantedBy = [ "multi-user.target" ];

      before = [
        "${mod_name}.service"
        "physio_chain.service"
      ];

      pathConfig = {
        PathChanged = override_dir;
        Unit = "monitor_${mod_name}.service";
      };
    };

    systemd.services."monitor_${mod_name}" = {
      description = "monitor physio_chain override dir";

      wantedBy = [ "multi-user.target" ];
      before = [
        "${mod_name}.path"
        "${mod_name}.service"
        "physio_chain.service"
      ];

      serviceConfig = {
        Type = "oneshot";

        ExecStart = pkgs.writeShellScript "monitor" ''
          set -euo pipefail

          readonly n=$(find ${override_dir} -type f | wc -l)

          if [ $n -gt 0 ]; then
            systemctl start --no-block ${mod_name}.service
          else
            systemctl start --no-block physio_chain.service
          fi
        '';
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
        StartLimitIntervalSec = "3600";
        StartLimitBurst = 5;
      };

      environment = {
        POETRY_CACHE_DIR = "/var/cache/${mod_name}";
        INFLUX_URL = "https://influx.airspecs.resenv.org";
        INFLUX_ORG = "media-lab";
        INFLUX_BUCKET = "sensor_data_boston";

        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
          pkgs.stdenv.cc.cc
        ];
      };

      serviceConfig = {
        Type = "exec";

        ExecStartPre = "${pkgs.poetry}/bin/poetry install --no-root";
        ExecStart = "${pkgs.poetry}/bin/poetry run gunicorn -n 4 -b 0.0.0.0:8234 -t 240 --pythonpath ${override_dir}/flaskWebsite app:app";

        WorkingDirectory = override_dir;

        EnvironmentFile = config.sops.secrets."gptree_env".path;

        DynamicUser = true;

        CacheDirectory = mod_name;

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

    systemd.tmpfiles.settings.${mod_name}.${override_dir}.d = {
      user = "nobody";
      group = group_name;

      mode = "0770";
    };

    users.groups.${group_name} = {};
  };
}
