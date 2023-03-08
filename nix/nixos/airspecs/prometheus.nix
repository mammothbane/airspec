{ config, ... }: {
  services.prometheus = {
    enable = true;
    port = 9001;

    exporters = {
      node = {
        enable = true;
        enabledCollectors = [
          "systemd"
        ];
      };
    };

    scrapeConfigs = [
      {
        job_name = "local_node";
        static_configs = [
          {
            targets = [
              "127.0.0.1:${toString config.services.prometheus.exporters.node.port}"
            ];
          }
        ];
      }

      {
        job_name = "ingest";
        static_configs = [
          {
            targets = [
              "127.0.0.1:47823"
            ];
          }
        ];

        scrape_interval = "10s";
        scrape_timeout = "5s";
      }
    ];
  };
}
