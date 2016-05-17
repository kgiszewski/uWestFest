# Url Picker

Url Picker Property Editor from uWestFest

Install via NuGet or the Umbraco Package Installer: https://github.com/imulus/uWestFest/releases

## Setup

### Install Dependencies

*NOTE: typings for `umbraco.services` and `umbraco.resources` are a little behind; use `git checkout -- typings` after running `typings install` and reference repository versions until resolved* 

```bash
npm install -g grunt-cli
npm install
typings install
git checkout -- typings
```

### Build

```bash
grunt
```

### Watch

```bash
grunt watch
```

### tslint

```bash
grunt tslint
```