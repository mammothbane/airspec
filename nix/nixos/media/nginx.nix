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
        locations."/".return = "301 $scheme://airspecs.resenv.org$request_uri";
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
