{
  stdenv,
  fetchFromGitHub,
  runCommandLocal,

  python3Packages,
  sd,

  writeShellApplication,
}: let
  version = "2f58fecb152fccdf5f1a1ea1cec0469788178ecb";

  src = builtins.fetchGit {
    url = "ssh://git@github.com/cathy-mengying-fang/physio_chain";
    ref = "mqdc";
    rev = version;
  };

  filteredSrc = runCommandLocal "get-src" {} ''
    mkdir -p $out

    cp ${src}/flaskWebsite/*.py $out
  '';

in writeShellApplication {
  name = "physio_chain";

  runtimeInputs = [
    (python3Packages.python.withPackages (pypkgs: with pypkgs; [
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
    ]))
  ];

  text = ''
    set -euo pipefail

    exec python3 -m gunicorn "$@" --pythonpath "${filteredSrc}" 'app:app'
  '';
}
