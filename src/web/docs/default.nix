{
  stdenv,
  python3,
  lib,
  self,
}: let
  pydeps = pypkgs: with pypkgs; [
    mkdocs-material
    pygments
  ];

in stdenv.mkDerivation {
  pname = "airspecs-docs";
  version = self.rev or "dirty";

  src = lib.cleanSource ./.;

  buildPhase = ''
    mkdocs build
  '';

  installPhase = ''
    mkdir -p $out
    ls site
    cp -r --reflink=auto site/* $out
  '';

  buildInputs = [
    (python3.withPackages pydeps)
  ];

  passthru = {
    inherit pydeps;
  };
}
