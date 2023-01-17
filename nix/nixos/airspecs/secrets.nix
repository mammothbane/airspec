{ config, lib, pkgs, ... }:

let
  keyGroup = config.users.groups.keys.name;

in {
  sops = {
    defaultSopsFile = ./secrets.yaml;

    secrets = {
      airspecs_server_env = {
        mode = "0400";
      };
    };
  };

  systemd.services.airspecs_server.serviceConfig.SupplementaryGroups = [ keyGroup ];
}
