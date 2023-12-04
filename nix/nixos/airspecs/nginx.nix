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
      "airspecs.resenv.org" = commonOptions // {
        serverAliases = [
          "airspec.resenv.org"
        ];

        locations."/" = {
          root = flake.packages.x86_64-linux.website;
        };

        locations."/docs".return = "301 $scheme://$host$request_uri/";

        locations."/docs/" = {
          alias = "${flake.packages.x86_64-linux.docs-site}/";
        };
      };

      "influx.airspecs.resenv.org" = commonOptions // {
        serverAliases = [
          "influx.airspec.resenv.org"
        ];

        locations."/" = {
          proxyPass = "http://localhost:${builtins.toString 8086}/";
        };
      };

      "grafana.airspecs.resenv.org" = commonOptions // {
        serverAliases = [
          "grafana.airspec.resenv.org"
        ];

        locations."/" = {
          proxyPass = "http://localhost:${builtins.toString config.services.grafana.settings.server.http_port}/";
        };
      };

      "api.airspecs.resenv.org" = commonOptions // {
        serverAliases = [
          "api.airspec.resenv.org"
        ];

        locations."/" = {
          proxyPass = "http://localhost:6666/";
          extraConfig = ''
            proxy_read_timeout 120;
          '';
        };
      };

      "gptree.airspecs.resenv.org" = commonOptions // {
        locations."/" = {
          proxyPass = "http://localhost:8123/";
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
