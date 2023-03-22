{
  services = {
    influxdb2 = {
      enable = true;

      settings = {
        query-concurrency = 2;
        query-max-memory-bytes = 1024 * 1024 * 512;
        reporting-disabled = true;
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
