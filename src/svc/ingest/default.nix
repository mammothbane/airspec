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
    pname = "airspecs-ingest";

    src = lib.cleanSourceWith {
      src = ../../..;
      filter = protoOrCargo;
    };

    buildInputs = [
      protobuf
    ];

    nativeBuildInputs = [
    ];

    cargoExtraArgs = "-p airspecs_ingest --features bench";

    inherit NANOPB_PROTO;
  };

  cargoVendorDir = crane-lib.vendorCargoDeps (commonOptions // {
    pname = "airspecs-global";
  });

  cargoArtifacts = crane-lib.buildDepsOnly (commonOptions // {
    pname = "airspecs-global";
    inherit cargoVendorDir;
  });

  rustFmt = crane-lib.cargoFmt (commonOptions // {
    inherit cargoVendorDir cargoArtifacts;

    preBuild = ''
      echo -ne '\n' > src/svc/ingest/src/pb.rs
    '';

    cargoExtraArgs = "";
  });

  clippy = crane-lib.cargoClippy (commonOptions // {
    inherit cargoArtifacts cargoVendorDir;
    cargoClippyExtraArgs = "--all-targets -- --deny warnings";
  });

  mkbin = binary: crane-lib.buildPackage (commonOptions // {

    inherit cargoVendorDir cargoArtifacts;

    buildInputs = commonOptions.buildInputs ++ [
      rustFmt
      clippy
    ];

    cargoExtraArgs = commonOptions.cargoExtraArgs + " --bin ${binary}";
  });

in (mkbin "airspecs_ingest").overrideAttrs (final: prev: {
  passthru = (prev.passthru or {}) // {
    provision_admin = (mkbin "provision_admin").overrideAttrs (final: prev: { pname = "provision_admin"; });
  };
})
