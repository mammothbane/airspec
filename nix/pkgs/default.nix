{ pkgs, self ? null }: {
  docs-site = pkgs.callPackage ../../web/docs   { inherit self; };
  website =   pkgs.callPackage ../../web/website { inherit self; };
}
