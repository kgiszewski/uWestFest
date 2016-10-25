# UrlPicker for Umbraco v7 #

![UrlPicker](assets/urlpicker-icon-128.png)

[![Build status](https://ci.appveyor.com/api/projects/status/k92sy9ea8oak14n6?svg=true)](https://ci.appveyor.com/project/JeavonLeopold/uwestfest-x4mvd)

Originally built during uWestFest 2014 and released on NuGet only. Now available to non-Nugeteers.

Authored by Tom Fulton, Kevin Giszewski, Jeavon Leopold, Bjarne Fyrstenborg and others.

If using v0.15.x+ with Umbraco Core 7.2.8 and lower, please note you will need to merge translation keys manually into the language file of choice.

v0.16.0 contains an (un)breaking change as the value converter will now return either a `UrlPicker` object or a `IEnumerable<UrlPicker>` depending on if the developer has set UrlPicker to multiple mode in the data type prevalues

## Installation ##

Both NuGet and Umbraco packages are available. 

|NuGet Packages    |Version           |
|:-----------------|:-----------------|
|**Release**|[![NuGet download](http://img.shields.io/nuget/v/urlpicker.svg)](https://www.nuget.org/packages/urlpicker/)
|**Pre-release**|[![MyGet download](https://img.shields.io/myget/umbraco-packages/vpre/urlpicker.svg)](https://www.myget.org/feed/umbraco-packages/package/nuget/urlpicker)

|Umbraco Packages  |                  |
|:-----------------|:-----------------|
|**Release**|[![Our Umbraco project page](https://img.shields.io/badge/our-umbraco-orange.svg)](https://our.umbraco.org/projects/backoffice-extensions/urlpicker/) 
|**Pre-release**| [![AppVeyor Artifacts](https://img.shields.io/badge/appveyor-umbraco-orange.svg)](https://ci.appveyor.com/project/JeavonLeopold/uwestfest-x4mvd/build/artifacts)

## Usage ##

Examples available in the [Wiki](https://github.com/kgiszewski/uWestFest/wiki/Usage)