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
    regex = ".+\.((c|h)(pp)?|ld|a|proto)$";
    matches = match regex path != null;
    is_cmake_lists = hasSuffix "/CMakeLists.txt" path;
  in type == "directory" || matches || is_cmake_lists;

  src = lib.cleanSourceWith {
    src = ../..;
    filter = path: type: (isProto path type) || (isFirmwareDir path type) || (isFirmwareFile path type);
  };

  nanopb_version = "0.4.7";
  nanopb_src = fetchFromGitHub {
    owner = "nanopb";
    repo = "nanopb";
    rev = nanopb_version;
    sha256 = "EgrEUQbxLn3Hxn33UokkkDRgkmDwCC/h6lA6YPX4yp8=";
  };

in stdenv.mkDerivation {
  pname = "firmware";
  version = self.rev or "dirty";

  cmakeFlags = [
    "-DCMAKE_MODULE_PATH=${nanopb_src}/extra"
  ];

  preConfigure = ''
    cd src/firmware
  '';

  preBuild = ''
    mkdir -p nanopb/generator/proto
    cp ${nanopb}/share/nanopb/generator/proto/nanopb.proto nanopb/generator/proto/nanopb.proto
  '';

  inherit
    src
    buildInputs
    nativeBuildInputs
    ;
}
