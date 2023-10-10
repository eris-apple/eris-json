# ErisJson

* [About](#about-package)
* [Installation](#installation)
* [Example](#example)

## About package
ErisJson is a utility for parsing and serializing json data

##  Installation

```shell
npm i eris-logger
```

## Examples

```ts
const file = readFileSync(path.join('data.json'));

const parser = new JSONParser(file.toString());
const parsedData = parser.parse(); // objects
```

```ts
const serializer = new JSONSerializer();
const jsonString = serializer.stringify(data); // string
```
