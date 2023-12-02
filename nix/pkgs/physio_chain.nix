{
  stdenv,
  fetchFromGitHub,
  runCommandLocal,

  python3Packages,
  coreutils,
  sd,

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

    ${sd}/bin/sd -F 'from langchain.agents.agent_toolkits import create_python_agent' 'from langchain_experimental.agents.agent_toolkits import create_python_agent' $out/{agent,gpt}.py

    ${sd}/bin/sd -F 'from langchain.tools.python.tool import PythonREPLTool' 'from langchain_experimental.tools.python.tool import PythonREPLTool' $out/{agent,gpt}.py

    ${sd}/bin/sd "^app\.run\(.*\)$" "" $out/app.py
  '';

in writeShellApplication {
  name = "physio_chain";

  runtimeInputs = [
    coreutils

    (python3Packages.python.withPackages (pypkgs: with pypkgs; [
      gunicorn
      openai
      langchain
      flask
      flask-cors
      pandas
      pytz
      python-dotenv

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
