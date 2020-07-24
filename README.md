# ember-app-explorer
A CLI tool to explore your Ember.js app folders

## Features
- View File size composition of your `app/` folder
- Find the file size of your components, routes, etc in decreasing order
- Find where your components, services are used in the app
- Find the asset composition of your builds like percentage of JS,CSS and images

## Install
```
npm i -g ember-app-explorer

```

You can also use npx like:
```
npx ember-app-explorer
```

## Usage

```
ember-app-explorer
```

Using current folder.
```
eax 
```

Specifying a path
```
eax ~/Users/user/code/my-ember-app
```

## Screenshots
![screenshot](screenshots/home.png)

![build](screenshots/build.png)

![components](screenshots/components.png)

## Help
```
    ['Next Page', 'Right Arrow'],
    ['Prev Page', 'Left Arrow'],
    ['Up', 'Up Arrow / k'],
    ['Down', 'Down Arrow / j'],
    ['Select', 'Enter / l'],
    ['Quit', 'q / Esc / Ctrl-c'],
    ['Help', '?'],
    ['Go to Home', 'h'],
    ['Search', '/'],
    ['Go to the beginning of any list', 'gg'],
    ['Go to the end of any list', 'G']
```


