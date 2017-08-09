# spk-cli
##### [pre-release]

Command line tool for importing project templates and running tasks

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ npm i -g spk-cli
```

### Usage

``` bash
# show cli help
$ spk
$ spk use

# list templates
$ spk use -l
$ spk use --list

# use a template
$ spk use <template-uid>
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
