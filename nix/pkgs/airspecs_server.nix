{
  protobuf,
  crane-lib,
  nanopb,
  lib,
}: let
  protoFilter = path: _type: (builtins.match ".*/proto(/(.*.proto)?)?$" path) != null;
  protoOrCargo = path: type: (protoFilter path type) || (crane-lib.filterCargoSources path type);

  NANOPB_PROTO = "${nanopb}/share/nanopb/generator/proto";

  commonOptions = {
    pname = "airspec-server";

    src = lib.cleanSourceWith {
      src = ../..;
      filter = protoOrCargo;
    };

    buildInputs = [
      protobuf
    ];

    nativeBuildInputs = [
    ];

    inherit NANOPB_PROTO;
  };

  cargoVendorDir = crane-lib.vendorCargoDeps (commonOptions // {
  });

  cargoArtifacts = crane-lib.buildDepsOnly (commonOptions // {
    inherit cargoVendorDir;
  });

  rustFmt = crane-lib.cargoFmt (commonOptions // {
    inherit cargoVendorDir cargoArtifacts;
    preBuild = ''
      echo -ne '\n' > src/pb.rs
    '';
  });

  clippy = crane-lib.cargoClippy (commonOptions // {
    inherit cargoArtifacts cargoVendorDir;
    cargoClippyExtraArgs = "--all-targets -- --deny warnings";
  });

in crane-lib.buildPackage (commonOptions // {
  inherit cargoVendorDir cargoArtifacts;

  buildInputs = commonOptions.buildInputs ++ [
    rustFmt
    clippy
  ];
})