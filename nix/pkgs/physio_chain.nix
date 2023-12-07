{
  stdenv,
  fetchFromGitHub,
  runCommandLocal,

  python3Packages,
  sd,

  writeShellApplication,
}: let
  version = "4c5a281f5b17cf078f11a108b51a3580b18fae37";

  src = builtins.fetchGit {
    url = "ssh://git@github.com/cathy-mengying-fang/physio_chain";
    ref = "npry.gptree";
    rev = version;
  };

  filteredSrc = runCommandLocal "get-src" {} ''
    mkdir -p $out

    cp ${src}/flaskWebsite/*.py $out
  '';

  pythonRuntime = python3Packages.python.withPackages (pypkgs: with pypkgs; [
    gunicorn
    openai
    langchain
    flask
    flask-cors
    pandas
    pytz
    python-dotenv
    influxdb-client

    (langchain.overridePythonAttrs (prevAttrs: {
      name = "langchain-experimental";

      sourceRoot = "${prevAttrs.src.name}/libs/experimental";

      pythonImportsCheck = [
        "langchain_experimental"
      ];

      doCheck = false;
    }))
  ]);

  app = writeShellApplication {
    name = "physio_chain";

    runtimeInputs = [
      pythonRuntime
    ];

    text = ''
      set -euo pipefail

      exec python3 -m gunicorn "$@" --pythonpath "${filteredSrc}" 'app:app'
    '';
  };

in app.overrideAttrs (finalAttrs: prevAttrs: {
  passthru = {
    inherit pythonRuntime;
  };
})
