{ ... }: let
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
