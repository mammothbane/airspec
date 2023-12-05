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

      gptree_env = {
        mode = "0400";
      };
    };
  };

  systemd.services.airspecs_server.serviceConfig.SupplementaryGroups = [ keyGroup ];
  systemd.services.physio_chain.serviceConfig.SupplementaryGroups = [ keyGroup ];
}
