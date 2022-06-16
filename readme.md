# 0xWho?

## Features

- Inline Address Labeling

![inline address labeling; before & after 0xwho](https://user-images.githubusercontent.com/84883138/174195088-141e26af-d2c7-4ecd-b949-6aafe5a2f90f.png)

- Tooltip on Selection

![select a address and display a tooltip](https://user-images.githubusercontent.com/84883138/174195547-45d678dd-3c75-45c0-88d6-8efd6cd3356e.png)


## How can use it?

1. clone the repo;
2. install deps:
```bash
yarn
```
3. build it:
```bash
yarn build
```
3. go to `chrome://extensions/`;
4. enable `Developer mode`;
5. `Load unpacked` and select the `extenstion` folder;

## Why not make the extenstion available through the chrome web store?

It's dangerous to use a chrome ext that can temper the content of your webpages.

So, read the code and build it yourself.

## 0xWho: lite version

The 0xWho ext tries to be lightweight as much as possible, but if you are super busy, we have a even lighter version for you:

Introducing: 0xwho, the Tampermonkey script version.

Now available at `tampermonkey/0xwho.js`