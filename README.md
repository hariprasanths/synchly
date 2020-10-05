# Synchly backups


![version](https://img.shields.io/github/package-json/v/hariprasanths/synchly?color=blue)
![Node Version](https://img.shields.io/node/v/synchly)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/hariprasanths/synchly/blob/master/docs)
[![License: Apache-2.0](https://img.shields.io/github/license/hariprasanths/synchly)](https://github.com/hariprasanths/synchly/blob/master/LICENSE)


* [Description](#description)
* [Features](#features)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Tab completion](#tab-completion)
* [Usage](#usage)
* [Quick setup](#quick-setup)
* [List of options](#list-of-options)
* [Running as a daemon](#running-as-a-daemon)
* [Examples](#examples)
* [Contributing](#contributing)
* [Show your support](#show-your-support)
* [License](#license)


## Description
Automate database backups with customizable recurring schedules.

## Features

* **Backup scheme** - Synchly uses a [Grandfather-father-son backup rotation scheme](https://en.wikipedia.org/wiki/Backup_rotation_scheme#Grandfather-father-son) (daily, weekly, monthly) that is fully customizable. <br/>Default schedule: 7 dailies + 8 weeklies + 6 monthlies (at max there will be 21 backups at a given instant).
* **Flexible scheduling** - Schedule the daily backups to fit your maintenance and development schedule, so that you get a clear picture of your database backups over time.
* **Supported Databases**
    * MySQL
    * MongoDB
* **Compression** - Compress the database backups to save up space.
* **Cloud Storage Integration** - Sync the local backups to remote storage of your choice.
* **Restoration** - Restore the database from the backups.
* **Supported remote storages**
    * Google Drive
    * SFTP
* **Status notifications** - Get daily status reports for successful and failed backups, delivered when you want them via SMTP to the specified email(s). Check [Usage](#usage) and the [List of Options](#list-of-options) below.
* **Multiple Backup Jobs** - Run multiple backup jobs in parallel. 
* **Encryption** - Encrypt the job configuration and backup files.

## Prerequisites

* node >=8

## Installation

The Synchly CLI is distributed as an NPM package. To use it, install it globally using:

```
npm install --global synchly
```

or using yarn:

```
yarn global add synchly
```

## Tab completion

The synchly package includes a useful tab-completion feature. This feature is installed automatically after the installation of the package. However, you might need to restart the console after installing the package for the autocomplete feature to work.

If you use **Bash**, it will create a file at ~/.synchly/completion.sh and append a loader code to ~/.bash_profile file.

If you use **Zsh**, it appends a loader code to ~/.zshrc file.

If you use **Fish**, it appends a loader code to ~/.config/fish/config.fish file.

## Usage

```
$ synchly [--config module]
$ synchly [--config module] [--file filepath]
$ synchly [--disablejob] [--job exampleJob]
$ synchly [--disable module] [--debug]
$ synchly [--enablejob] [--job exampleJob]
$ synchly [--enable module] [--stacktrace]
$ synchly [--help]
$ synchly [--job exampleJob] [--config module]
$ synchly [--jobs]
$ synchly [--reset]
$ synchly [--restore]
$ synchly [--run]
$ synchly [--start]
$ synchly [--version]
```

## Quick setup

Synchly can be run with `--help` flag to get a full list of flags.

The quickest way to get started is to run the `synchly --config=db` command.

To start synchly use the command `synchly --start`.</br>
Synchly instance have to be restarted everytime you make a change to the configuration using the [cli options](#list-of-options).

To restore database from the backup files use the command `synchly --restore`.</br>

Configuration of modules (remote-sync and smtp) can be added or updated using `synchly --config=module` command.
Initializing configurations can also be done using a file, `synchly --config=module --file=filepath`, refer [Configuration using file](https://github.com/hariprasanths/synchly/blob/master/docs/configuration-using-file.md#configuration-using-file).

By default, remote-sync and smtp modules are disabled, to enable them, use `synchly --enable=module` command.

To encyrpt the job configuration files use the command `synchly --enable=cipher` and to disable it globally use the command `synchly --disable=cipher`.
Encryption of backup files can be done only when cipher module is enabled.

For the complete list of options and their behavior, refer [List of options](#list-of-options).

For running synchly as a daemon, refer [Running as a deamon](#running-as-a-daemon).

For creating multiple backup jobs, refer [Running multiple jobs](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#running-multiple-jobs)

## List of options

<table width="100%">
<tbody>
    <tr>
        <th><h4>Option</h4></th>
        <th><h4>Description</h4></th>
    </tr>
    <tr>
        <td width="30%"><code>-c, --config=module</code></td>
        <td width="100%">
        <p>Create or update module configuration. <br/> Allowed modules: db | remote-sync | smtp</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-D, --debug</code></td>
        <td width="100%">
        <p>Prints even more information from CLI operations, used for debugging purposes</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>--disablejob</code></td>
        <td width="100%">
        <p>Disable a job. <br/> Use with option --job=NAME to disable the specific job NAME</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-d, --disable=module</code></td>
        <td width="100%">
        <p>Disable a module. <br/> Allowed modules: cipher | remote-sync | smtp</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>--enablejob</code></td>
        <td width="100%">
        <p>Enable a job. <br/> Use with option --job=NAME to enable the specific job NAME</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-e, --enable=module</code></td>
        <td width="100%">
        <p>Enable a module. <br/> Allowed modules: cipher | remote-sync | smtp</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-f, --file=filepath</code></td>
        <td width="100%">
        <p>Create or update module configuration using the specified file.<br/> To be used with --config flag</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-h, --help</code></td>
        <td width="100%">
        <p>Prints CLI reference information about options and their arguments</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-j, --job</code></td>
        <td width="100%">
        <p>Create a new synchly job with the NAME (creates a job named 'master' by default if the option --job is not specified). This is useful for running multiple backup jobs in parallel</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>--jobs</code></td>
        <td width="100%">
        <p>Displays information about all the synchly jobs</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>--reset</code></td>
        <td width="100%">
        <p>Reset all the configurations saved</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-R, --restore</code></td>
        <td width="100%">
        <p>Restore database from the backup</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-S, --stacktrace</code></td>
        <td width="100%">
        <p>Prints even more information about errors from CLI operation, used for debugging purposes. If you find a bug, provide output generated with the --stacktrace flag on when submitting a bug report</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>--start</code></td>
        <td width="100%">
        <p>Start all the enabled synchly jobs which logs to stdout and stderr</p>
        </td>
    </tr>
    <tr>
        <td width="30%"><code>-v, --version</code></td>
        <td width="100%">
        <p>Display version information and exit</p>
        </td>
    </tr>
</tbody>
</table>

## Running as a daemon

Synchly can be run as a daemon, init.d and systemd unit files are bundled with the npm package to make this easier.

### If installed using npm:

#### init.d

```
$ npm install --global synchly
$ sudo cp /usr/local/lib/node_modules/synchly/bin/synchly.conf /etc/init
$ sudo start synchly
```

#### systemd

```
$ npm install --global synchly
$ cp /usr/local/lib/node_modules/synchly/bin/synchly.service  ~/.config/systemd/user/
$ systemctl --user enable synchly
$ systemctl --user start synchly
```

If the unit files are not there inside `/usr/local/lib/node_modules`, use `npm root -g` to get the global installation root path and copy the unit files from there.
The `WorkingDirectory` field in the `synchly.service` unit file also needs to be changed, if the global installation root path is different from `/usr/local/lib/node_modules`.

### If installed using yarn:

If installed using yarn global, the service init files will be located on 
* `/usr/local/share/.config/yarn/global/node_modules/synchly/bin/` - if logged in as root
* `~/.config/yarn/global/node_modules/synchly/bin` - if logged in as non-root


**NOTE: Don't forget to restart the daemon everytime you make a change to the configuration using the [cli options](#list-of-options).**

## Examples

* [Database configuration](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#database-configuration)
    * [MongoDB](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#mongodb)
    * [MySQL](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#mysql)
* [Cloud Storage (remote-sync) configuration](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#cloud-storage-remote-sync-configuration)
    * [Google Drive](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#google-drive)
    * [SFTP](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#sftp)
* [Status notifications (smtp) configuration](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#status-notifications-smtp-configuration)
    * [Using Gmail](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#using-gmail)
* [Enabling modules](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#enabling-modules)
* [Disabling modules](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#disabling-modules)
* [Stacktrace of errors](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#stacktrace-of-errors)
* [Running multiple jobs](https://github.com/hariprasanths/synchly/blob/master/docs/examples.md#running-multiple-jobs)

## Contributing

I'd love your help! If you have ideas for new features or feedback, let me know by creating an issue in the [issues list](https://github.com/hariprasanths/synchly/issues).

## Show your support

Give a :star: if this project helped you!

## License

Copyright :copyright: 2020 [Hariprasanth S](https://github.com/hariprasanths)

This project is licensed under the [Apache License, Version 2.0](https://github.com/hariprasanths/synchly/blob/master/LICENSE)
<br/>You may also obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0
