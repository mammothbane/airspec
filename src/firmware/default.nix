{
  cmake,
  protobuf,
  pkgsCross,
  self,
  lib,
  stdenv,
  nanopb,
  fetchFromGitHub,
}: let
  cross = pkgsCross.armhf-embedded;

  buildInputs = [
  ];

  nativeBuildInputs = [
    protobuf
    cmake
    cross.stdenv.cc
    nanopb
  ];

  isProto = path: _type: builtins.match ".*(/proto/.*|.*\.proto)" path != null;

  isFirmwareDir = path: type: type == "directory" && builtins.match ".*/src(/firmware)?" path != null;

  isFirmwareFile = path: type: with builtins; with lib; let
    regex = ".+\.((c|h)(pp)?|s|ld|a|proto)$";
    matches = match regex path != null;
    is_cmake_lists = hasSuffix "/CMakeLists.txt" path;
  in type == "directory" || matches || is_cmake_lists;

  src = lib.cleanSourceWith {
    src = ../..;
    filter = path: type: (isProto path type) || (isFirmwareDir path type) || (isFirmwareFile path type);
  };

  name = "airspecs_firmware";

in cross.stdenv.mkDerivation {
  pname = name;
  version = self.rev or "dirty";

  cmakeFlags = [
    "-DCMAKE_MODULE_PATH=${nanopb.src}/extra"
    "-DCMAKE_VERBOSE_MAKEFILE=ON"
  ];

  inherit
    src
    buildInputs
    nativeBuildInputs
    ;

  preConfigure = ''
    cd src/firmware
  '';

  preBuild = ''
    mkdir -p nanopb/generator/proto
    cp ${nanopb}/share/nanopb/generator/proto/nanopb.proto nanopb/generator/proto/nanopb.proto
  '';

  installPhase = ''
    mkdir -p $out
    cp ${name}.{elf,bin,hex} $out
  '';
}
