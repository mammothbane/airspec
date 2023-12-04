{ pkgs, self ? null }: {
  docs-site       = pkgs.callPackage ../../src/web/docs     { inherit self; };
  website         = pkgs.callPackage ../../src/web/website  { inherit self; };
  swift_protobuf  = pkgs.callPackage ./swift_protobuf.nix   {};
  ingest          = pkgs.callPackage ../../src/svc/ingest   {};
  grpc_swift      = pkgs.callPackage ./grpc_swift.nix       {};
  firmware        = pkgs.callPackage ./firmware             { inherit self; };
  physio_chain    = pkgs.callPackage ./physio_chain.nix     {};
}
