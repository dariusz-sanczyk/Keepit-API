## Description

Program that receives the URL to a web site as a command line argument, retrieves the HTML web page content, finds the HTML unordered list with the most direct children, and returns the number of items in that list.

## Installation

```bash
$ npm install
```

## Compile app

```bash
$ npx tsc
```

## Example use

```bash
$ node dist/src/main.js http://google.com
```

If the URL contains a <ul> with the most direct <li> children, the application will output a number of childrens.
