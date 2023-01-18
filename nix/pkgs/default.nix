{ pkgs, self ? null }: {
  docs-site       = pkgs.callPackage ../../web/docs         { inherit self; };
  website         = pkgs.callPackage ../../web/website      { inherit self; };
  swift_protobuf  = pkgs.callPackage ./swift_protobuf.nix   {};
  server          = pkgs.callPackage ./airspecs_server.nix  {};
  grpc_swift      = pkgs.callPackage ./grpc_swift.nix       {};
}
