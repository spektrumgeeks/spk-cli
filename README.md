# spk-cli
##### [pre-release]

Command line tool for importing project templates and running tasks

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ npm i -g https://github.com/spektrummedia/spk-cli.git
```

>_Note_: this tool uses git to keep templates up to date but can\'t authenticate connections over `ssh` if your key uses a passphrase. In such cases you will need to provide a token to connect over `https`. See tokens section below for more information.

## Usage
### Install


``` bash
$ spk <command> [options...]

# install command ( alias: i )
$ spk install <template>
$ spk install --list

# run command
$ spk run <tool> [options...]
```

Example:

``` bash
# use vue-cli to init a new VueJS project
$ vue init webpack
[...]
# apply our template on top of it
$ spk use vue
```

The above command clones/pulls the template from [bitbucket.org:spektrummedia/vue-spk-template](https://bitbucket.org/spektrummedia/vue-spk-template), and removes unnecessary files from your project, copies files you will need for our setup into your project and edits some `package.json` fields (without overwriting what is already there).

### Adding templates

Instructions coming soon.
