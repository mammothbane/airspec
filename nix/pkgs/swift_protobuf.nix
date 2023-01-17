{
  stdenvNoCC,
  swift,
  fetchFromGitHub,
  pkgs,
  clang,
  lib,
  ...
}: let
  src = fetchFromGitHub {
    owner = "apple";
    repo = "swift-protobuf";
    rev = "1.9.0";
    sha256 = "1ClJaQiExafW7Yq0ig8OX4rJcxDVu9HzUie/l4zbNf8=";
  };

in stdenvNoCC.mkDerivation {
  pname = "swift-protobuf";
  version = src.rev;

  src = lib.cleanSource src;

  nativeBuildInputs = [
    swift
    clang
  ];

  buildPhase = ''
    HOME=$PWD swift build -c release
  '';

  installPhase = ''
    mkdir -p $out/bin
    install -m 0755 .build/release/protoc-gen-swift $out/bin
  '';
}
