# How to initialize the nodejs typescript project in Production

1. Run `npm init -y` which initialize a nodejs project. _(Pure Javascript)_

```bash
npm init -y
```

2. Now install typescript dependencies.

```bash
npm i typescript tsx @types/node @tsconfig/nodexx --save-dev
```

```bash
code tsconfig.json
```

This is generates `tsconfig.json` file and typescript configs in it. we can config as per our project requirement.

3. Edit your `package.json` file, write the srcipts for `dev` and `build` cmd.

```json
"scripts": {
    "dev": "nodemon --watch src --ext ts --exec tsx src/index.ts",
    "build": "tsc"
  },
```

> [!TIP]  
> Now you see changes and test build and dev cmd, it will work.
