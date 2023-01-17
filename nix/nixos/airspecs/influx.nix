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
          root_url = "https://airspecs.media.mit.edu/grafana";
          serve_from_sub_path = true;

          enable_gzip = true;
        };

        users.allow_sign_up = false;
      };
    };
  };
}
