{ flake, config, ... }: let
  commonOptions = {
    onlySSL = true;
    enableACME = true;
  };

in {
  services.nginx = {
    enable = true;

    recommendedGzipSettings = true;
    recommendedTlsSettings = true;
    recommendedOptimisation = true;
    recommendedProxySettings = true;

    resolver.addresses = ["1.1.1.1:53"];

    virtualHosts = {
      "airspecs.media.mit.edu" = commonOptions // {
        locations."/" = {
          root = flake.packages.x86_64-linux.website;
        };

        locations."/docs".return = "301 $scheme://$host$request_uri/";

        locations."/docs/" = {
          alias = "${flake.packages.x86_64-linux.docs-site}/";
        };

        locations."/grafana" = {
          proxyPass = "http://localhost:${builtins.toString config.services.grafana.settings.server.http_port}";
        };

        locations."/api" = {
          proxyPass = "http://localhost:6666";
        };

        locations."/assets/firmware/" = {
          alias = "${flake.packages.x86_64-linux.firmware}/bin/";

          extraConfig = ''
            autoindex on;
            autoindex_exact_size off;
          '';
        };
      };

      "default" = {
        default = true;

        serverName = "_";

        locations = {
          "^~ /.well-known/acme-challenge" = {
            root = "/var/lib/acme/acme-challenge";
            tryFiles = "$uri $uri/ =404";

            extraConfig = ''
              autoindex   off;
              auth_basic  off;
            '';
          };

          "/".return = "301 https://$http_host$request_uri";
        };
      };
    };
  };
}
