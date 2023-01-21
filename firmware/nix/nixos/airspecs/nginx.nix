{ flake, ... }: let
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
      "localhost" = {
        listen = [
          {
            addr = "127.0.0.1";
            port = 80;
          }
        ];

        locations."/" = {
          root = flake.packages.x86_64-linux.site;
        };
      };

      "airspecs.media.mit.edu" = commonOptions // {
        locations."/" = {
          root = flake.packages.x86_64-linux.site;
        };
      };

      "influx.airspecs.media.mit.edu" = commonOptions // {
        locations."/" = {
          proxyPass = "http://localhost:8086/";

          extraConfig = ''
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
          '';
        };
      };
    };
  };
}
