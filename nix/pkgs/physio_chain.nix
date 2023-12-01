{
  stdenv,
  fetchFromGitHub,
  runCommandLocal,

  python3Packages,
  coreutils,

  writeShellApplication,
}: let
  version = "6ac55543213cc0fbebd5d0138480007705c39d97";

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
    coreutils

    (python3Packages.python.withPackages (pypkgs: with pypkgs; [
      gunicorn
      openai
      langchain
      langchain_experimental
      flask
      pandas
      pytz
    ]))
  ];

  text = ''
    set -euo pipefail

    exec python3 -m gunicorn -w "$(nproc)" --pythonpath "${filteredSrc}" 'app:app'
  '';
}
