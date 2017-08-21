# spk-cli
##### [pre-release]

Command line tool for importing project templates and running tasks

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred), npm version 3+ and [Git](https://git-scm.com/).

``` bash
$ npm i -g https://github.com/spektrummedia/spk-cli.git
```

>_Note_: this tool uses git to keep templates up to date but can't authenticate connections over `ssh` if your key uses a passphrase. In such cases you will need to provide a token to connect over `https`. See tokens section below for more information.

## Commands
### install (alias: i)

Install a template into a new or existing project. Generally, you will do this after running all the other steps for setting up your project, such as running `vue init webpack` for a VueJS project or `npm init` for a static website project.

The template loader is designed to blend itself into an existing directory tree. Templates are kept up to date through `git` but will not add or overwrite an existing repo with it's own.

The process is comprised of 5 steps:

- Ensure the checkfile exists, if provided, in your current directory.
- Remove unwanted assets that may have been installed by previous steps.
- Copy new assets into the directory tree. This will overwrite existing files of the same name.
- Edit target package.json, such as adding dependencies, npm scripts, etc.
- Find and replace variables in project with user supplied values

``` bash
# install a template
$ spk install <template>

# prevent from deleting or overwriting existing files
$ spk install <template> [--safe | -s]

# list available templates
$ spk install [--list | -l]
```

## Adding templates

To add a template to this tool, two steps are required:

- Add your template to `index.json` in the spk-templates snippet on our team BitBucket.
- Add a `template.json` file to the root directory of the template's repo.

### spk-templates index.json

The index file is essentially a `JSON` object whose keys are the templates unique ID. Each template must have a `provider` field of either `bitbucket` or `github` and a repo field indicating the path to the template's repository.

An optional `alias` field can be added containing an array of other keywords this template corresponds to. In the event that multiple templates have an identical alias, the user will be prompted to select which one they wish to apply.

###### Sample
``` json
{
  "gulp": {
    "alias": ["gulpfile", "rollup", "sass", "babel", "eslint"],
    "provider": "bitbucket",
    "repo": "spektrummedia/gulp-template.git"
  }
}
```

### template.json

The template's contents will be copied over into the destination's directory tree verbatim. If none of the optional fields below are present, this will be the only action taken by the installer.

The `template.json` file, which should be found in the repository's root, contains fields representing instructions for the installer to follow.

#### Fields

- ##### `uid <string>`

  _required_

  The template's unique ID in the template index.

- ##### `name <string>`

  _required_

  The template's name.

- ##### `checkfile <string>`

  _optional_

  The installer will assert this file's presence in the current working directory (where the template is to be installed) before continuing.

- ##### `remove <array>`

  _optional_

  An array indicating files that should be removed before importing the template's files. Keep in mind that unless `--safe` mode is specified, the installer will overwrite existing files so it is not necessary to remove files that may already exist.

  In `--safe` mode, this step is skipped altogether.

- ##### `package <object>`

  _optional_

  An object with instructions on how to modify the destination's `package.json`, generally for adding dependencies. Use any of the following keys:

  - `remove <array>`: fields to be removed from the destination.

  - `replace <any>`: overwrite the destination's value.

  - `merge <object> | <array>`: will attempt to merge the template's value with the destination's. If duplicate values are found, the template's values take precedence. If the provided value is a string, `replace` will be used instead.

- ##### `replace <object>`

  _optional_

  An optional `placeholder` field can be provided to indicate the character wrapping the variables in the template files. Defaults to `%`.

  The `queries` field is required and must be an object. Each key in the object should be a path/glob or a comma separated list of paths/globs representing the scope for it's array of queries.

  Each item in the array should be a string or an object with only 1 key-value pair.

  The full syntax for the strings/keys is `variable[:label][=default]` where:

  - `variable` is required and is the keyword to be replaced in the destination files.

  - `label` is optional and is the "question" the user will be prompted with. If missing, the `variable` is used.

  - `default` is optional and is the default value to be assigned to the variable if the query is an "input". This field will be ignored if the query is a "list" or "boolean". If missing, no default value is assigned.

  For example, if provided `user:user name=dev`, the replacement looks for `%user%`, will prompt with the label `user name` and will have a default value of `dev`.

  Each array item will be evaluated to resolve the type of query following these rules:

  - If the item is a `string`, the user will be prompted for a text input.

  - If the object's value is a boolean, the user will prompted with a "yes/no" returning `true` or `false` for the replacement. The query's default value will be the provided boolean.

  - If the object's value is an array, the user will be prompted with a selection list. The syntax is `value[:label]` where `value` is what the replacement will receive be and `label` the option's name in the list. If you wish to return an empty string as the value, simply put the placeholder twice, for example: `%%:none` will provide the option as "none" and will replace with an empty string.

###### Sample
``` json
{
  "uid": "sample",
  "name": "sample template",
  "checkfile": "build/vue-loader.conf.js",
  "remove": ["src/assets/logo.png", "src/components/Hello.vue"],
  "package": {
    "remove": ["main", "repository", "keywords", "license"],
    "merge": {
      "devDependencies": {
        "node-sass": "^4.5.3",
        "sass-loader": "^6.0.6"
      }
    },
    "replace": {
      "browserslist": [
        "last 2 versions",
        "not ie <= 9"
      ]
    }
  },
  "replace": {
    "placeholder": "%",
    "queries": {
      "config/**/*": ["database", "user:database user", "pass:database password=dev", { "index": false }],
      "config/meta.xml, src/*.Site/web.config": [
        { "vcs": ["git", "mercurial:other", "%%:none"] },
        { "blog:enable blog feature": true },
        { "env:environment": ["development", "staging", "production"] }
      ]
    }
  }
}
```
