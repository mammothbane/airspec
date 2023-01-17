{
  naersk,
  protobuf,
  crane-lib,
}: let
  commonOptions = {
    pname = "airspec-server";

    src = crane-lib.cleanCargoSource ../..;

    buildInputs = [
      protobuf
    ];

    nativeBuildInputs = [
    ];
  };

  cargoVendorDir = crane-lib.vendorCargoDeps (commonOptions // {
  });

  cargoArtifacts = crane-lib.buildDepsOnly (commonOptions // {
    inherit cargoVendorDir;
  });

in crane-lib.buildPackage (commonOptions // {
  inherit
    cargoArtifacts
    cargoVendorDir
    ;
})
