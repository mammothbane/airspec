{
  fetchzip,
  buildPlatform,
}: let
  pname = "protoc-grpc-swift";
  version = "1.13.2";

  platformDesg = if buildPlatform.isDarwin then ""
    else if (buildPlatform.isLinux && buildPlatform.isx86_64) then "linux-x86_64-"
    else throw "bad platform";

  sha256 = if buildPlatform.isDarwin then ""
    else "LNhMvNqlD+nhQtsus/UQ+kNTB9XFoeT73woI78bc0gI=";


# I'm giving up on patching this for linux -- the executables are dynamically linked, but they depend on all sorts of
# apple runtime libraries that I don't want to rebuild.
#
# Building from scratch doesnt work either -- compiler bug.
in fetchzip {
  inherit pname version sha256;

  stripRoot = false;

  url = "https://github.com/grpc/grpc-swift/releases/download/${version}/protoc-grpc-swift-plugins-${platformDesg}${version}.zip";

  postFetch = ''
    mkdir -p $out/bin
    mv $out/protoc-* $out/bin
  '';
}
