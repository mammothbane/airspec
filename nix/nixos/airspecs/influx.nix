{
  services = {
    influxdb2 = {
      enable = true;

      settings = {
      };
    };

    grafana = {
      enable = true;

      settings = {
        server = {
          root_url = "https://grafana.airspecs.resenv.org";
          enable_gzip = true;
        };

        users.allow_sign_up = false;
      };
    };
  };
}
