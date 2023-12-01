{
  runCommand,
  fetchFromGitHub,

  poetry2nix,

  python3Packages,
}: let
  pname = "langchain";
  version = "0.0.343";

  #python3Packages = python39Packages;

  #src = python3Packages.fetchPypi {
    #inherit pname version;
    #hash = "sha256-Fmkk13GkYwCSd/aI9t/IKaOvLZzVtBpkp6a9eGAoDoE=";
  #};

  #unzippedSrc = runCommand "test" {} ''
    #mkdir -p $out
    #cd $out
    #tar --strip-components=1 -xf ${src}
  #'';

  src = fetchFromGitHub {
    owner = "langchain-ai";
    repo = "langchain";
    rev = "v${version}";
    hash = "sha256-8pKZkngKMHAiDm2w+C9QBeA+YyYcyFHe3jcjnfDE8ec=";
  };

  ppkgs = poetry2nix.mkPoetryPackages {
    projectDir = src;

    overrides = [
      poetry2nix.defaultPoetryOverrides 

      (pyfinal: pyprev: {
        #pip = pyprev.pip.overrideAttrs (finalAttrs: prevAttrs: {
          #postPatch = (prevAttrs.postPatch or "") + ''
## noop
          #'';
        #});

        bootstrapped-pip = pyprev.bootstrapped-pip.overrideAttrs (finalAttrs: prevAttrs: {
          postPatch = ''
            mkdir -p $out/bin
          '';
        });
      })
    ];
  };

in ppkgs


#python3Packages.buildPythonPackage {
  #inherit pname version;

#}
