let
  extraGroups = [
    "wheel"
    "uucp"
    "dialout"
    "sudo"
    "cdrom"
    "plugdev"
  ];

in {
  nix.settings.trusted-users = [
    "root"
    "npry"
  ];

  users = {
    mutableUsers = false;

    users = {
      root.hashedPassword = ''$6$d59cUd31u4j$LGIlTS.qmV60wYBt2ZvNX0p5SAQCplYTxwg3u8E359pHOq.ycP3zGbarD/.AN5IN.sUacHBleb8C3p3DDa2M5.'';

      npry = {
        isNormalUser = true;

        openssh.authorizedKeys.keys = [
          "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDNoZqilxVEnrC7Qx/xiMC9TdeA6y8FQJhjZumlDvx4efK/mf5tisiQB3H1x1qpafW8YffLeHNyx3g1gfuETOyEc4U30nmG1aNo02yFundJI2vpNHpO1A44p0qVXSV2EnbOWC1pMOC/42EMmOTKcCh5XU79GDSjnVFDmVwLt1dc+U962VO1xcw45rdDriLsXiIaEerw69P95jX+4HvKmw+ja+X8zOgHL4tbNJUQGUjePEtmNB8djFphYmdrc7paHkNEDLjU6DdBtVt/QD7V7tDwqXIeFvFxhSN20RZMSHZaztd2TzvnfmykFDJrhn3WCI1rrscKumApowR43StdcSSn cardno:000608501086"
        ];

        hashedPassword = ''$6$d59cUd31u4j$LGIlTS.qmV60wYBt2ZvNX0p5SAQCplYTxwg3u8E359pHOq.ycP3zGbarD/.AN5IN.sUacHBleb8C3p3DDa2M5.'';

        inherit extraGroups;
      };

      sailinz = {
        isNormalUser = true;
        hashedPassword = "$6$uKdCA73CzHNbOTI4$x32h67RO4ziXdYSieikkRArlGu28rhgWleVpsWT4IC5Z.UCuvaQRznjiQ2L/OQfr/GUecOeZ8rlIqAi.81/491";

        inherit extraGroups;
      };

      chwalek = {
        isNormalUser = true;
        hashedPassword = "$6$uKdCA73CzHNbOTI4$x32h67RO4ziXdYSieikkRArlGu28rhgWleVpsWT4IC5Z.UCuvaQRznjiQ2L/OQfr/GUecOeZ8rlIqAi.81/491";

        inherit extraGroups;
      };
    };
  };
}
