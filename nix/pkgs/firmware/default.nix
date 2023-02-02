{
  cmake,
  protobuf,
  pkgsCross,
  self,
  lib,
  stdenv,
  fetchFromGitHub,
  binutils,
}: let
  cross = pkgsCross.armhf-embedded;

  buildInputs = [
  ];

  nativeBuildInputs = [
    protobuf
    cmake
    nanopb
  ];

  isProto = path: _type: builtins.match ".*(/proto/.*|.*\.proto)" path != null;

  isFirmwareFile = path: type: with builtins; with lib; let
    regex = ".+\.((c|h)(pp)?|s|ld|a|proto)$";
    matches = match regex path != null;
    is_cmake_lists = hasSuffix "/CMakeLists.txt" path;
  in type == "directory" || matches || is_cmake_lists;

  src = lib.cleanSourceWith {
    src = fetchFromGitHub {
      owner = "pchwalek";
      repo = "env_glasses";
      rev = "1b94a8f672490ac1ff45286b759558cc4fa8d2c9";
      sha256 = "";
      fetchSubmodules = true;
    };

    filter = path: type: (isProto path type) || (isFirmwareFile path type);
  };

  name = "airspecs_firmware";

in cross.stdenv.mkDerivation {
  pname = name;
  version = self.rev or "dirty";

  cmakeFlags = [
    "-DCMAKE_MODULE_PATH=${nanopb.src}/extra"
    "-DCMAKE_VERBOSE_MAKEFILE=ON"
    "-DCMAKE_BUILD_TYPE=Release"
  ];

  strictDeps = true;
  allowedRequisites = [];

  inherit
    src
    buildInputs
    nativeBuildInputs
    ;

  postUnpack = ''
    cp ${./CMakeLists.txt} source/CMakeLists.txt
  '';

  preBuild = ''

  '';

  installPhase = ''
    mkdir -p $out/bin
    cp ${name}.{elf,bin,hex} $out/bin
  '';
}
