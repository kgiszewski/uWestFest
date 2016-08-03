$version=[Version]$Env:APPVEYOR_BUILD_VERSION

$basever=$version.Major.ToString() + "." + $version.Minor.ToString() + "." + $version.Build.ToString()

If ($Env:version_suffix -eq "alpha"){
  $semver = $basever + "-alpha." + $version.Revision.ToString()
  $mssemver = $basever + "-alpha-" + $version.Revision.ToString()
  $appveyor_version = $mssemver
}
ElseIf ($Env:version_suffix -eq "beta"){
  $semver = $basever + "-beta." + $version.Revision.ToString()
  $mssemver = $basever + "-beta-" + $version.Revision.ToString()
  $appveyor_version = $mssemver
}
Else {
    $mssemver = $basever
    $semver = $basever
    $appveyor_version = $Env:APPVEYOR_BUILD_VERSION
}

$Env:semver = $semver
$Env:mssemver = $mssemver
$Env:appveyor_version = $appveyor_version

"Envrionment variable 'semver' set:" + $Env:semver
"Envrionment variable 'mssemver' set:" + $Env:mssemver
"Envrionment variable 'appveyor_version' set:" + $Env:appveyor_version