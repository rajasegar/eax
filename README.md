# ember-app-explorer
![Build and Deploy](https://github.com/rajasegar/eax/workflows/Build%20and%20Deploy/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/rajasegar/eax/badge.svg?branch=master)](https://coveralls.io/github/rajasegar/eax?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](http://img.shields.io/npm/v/ember-app-explorer.svg?style=flat)](https://npmjs.org/package/ember-app-explorer "View this project on npm")

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

## FAQs

### How do I quit this thing?
You can press `q`, or `Esc` or `C-c` to quit the program at any time.

### How can I see the keyboard shortcuts for navigating?
Press `?` to see the keyboard navigation shortcuts page.

### How can I quickly navigate to home page screen?
Press `h` to go to the home page.

### How do I navigate between different pages of the cli?
You can use the arrow keys to navigate between pages, `Left Arrow` to previous screen
and `Right Arrow` to next screen.

### How can I search for items in the list?
Press `/` to search in any list. A popup dialog will appear to enter the search term,
if the search functionality is enabled for that list where you have the focus.
The search term is fuzzy which means you can search for any part of the name.

### Does it support vi/vim navigation keys in the lists?
Yes
