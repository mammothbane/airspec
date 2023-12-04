{
  mkYarnPackage,
  lib,
  nodejs_18,
  yarn,
  fd,
  ripgrep,
  sd,
  ...
}: let
  yarn' = yarn.override { nodejs = nodejs_18; };
  package_contents = lib.importJSON ./package.json;
in mkYarnPackage {
  pname = "airspecs-website";
  version = package_contents.version;

  packageJSON = ./package.json;
  yarnLock = ./yarn.lock;

  buildPhase = ''
    # some packages are poorly-behaved and assume node_modules/.cache is writable, but
    # the whole node_modules directory is read-only because it's provided via nix.
    #
    # so: create a new empty node_modules, symlink each package independently from the old, and create .cache

    pushd deps/AirSpec

    mv node_modules node_modules.main
    mkdir node_modules

    for pkg in node_modules.main/*; do
      ln -s "$PWD/$pkg" "node_modules/$(basename $pkg)"
    done

    ln -s $PWD/node_modules.main/.bin             node_modules/.bin
    ln -s $PWD/node_modules.main/.yarn-integrity  node_modules/.yarn-integrity

    mkdir -p node_modules/.cache

    # move proto into build to fix resolution issues
    cp -R ${../../../proto} proto
    chmod -R a+rw proto

    ${ripgrep}/bin/rg -t ts -t js --files-with-matches '../../../proto/' . | \
      xargs ${sd}/bin/sd '../../../proto/' 'proto/'

    ${sd}/bin/sd 'const protopath = .*;$' "const protopath = '$(pwd)/proto';" config/webpack.config.js

    popd

    if ! ${yarn'}/bin/yarn --offline build; then
      echo 'yarn build failed for proto generation, retrying' >&2
      ${yarn'}/bin/yarn --offline build
    fi

    ${fd}/bin/fd -g '*.js.LICENSE.txt' deps/AirSpec/build/static | xargs rm
  '';

  outputs = [ "out" "debug" ];

  installPhase = ''
    mkdir -p $debug
    ${fd}/bin/fd -uuu -t f -g '*.js.map' deps/AirSpec/build | xargs -i mv '{}' $debug

    mkdir -p $out
    cp --reflink=auto -r deps/AirSpec/build/* $out
  '';

  distPhase = ''
    true # i.e.: ignore
  '';

  src = lib.cleanSource ./.;

  NODE_OPTIONS = "--openssl-legacy-provider";

  passthru.deps = [
    yarn'
  ];
}
