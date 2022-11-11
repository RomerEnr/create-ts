#!/usr/bin/env bash
":" //# comment; exec /usr/bin/env node --input-type=module - "$@" < "$0"

import { execSync } from "child_process";
import { existsSync, accessSync, constants } from "fs";

const color = (color, text) => {
  const COLORS = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
  };
  return `${COLORS[color]}${text}${COLORS["reset"]}`;
};

const chop = str => str.replace(/\n$/, "");
const exec = (cmd) => chop(execSync(cmd).toString());

const VERSION = "0.3.6";
const [NAME, ...ARGS] = process.argv.slice(2).map(arg => arg.toLowerCase());
const COMMAND = process.argv[0];
const PARAMS = process.argv.slice(2).length;
const CURL = exec(`echo $(which curl)`);
const PNPM = exec(`echo $(which pnpm)`);
const YARN = exec(`echo $(which yarn)`);
const ULTRA = exec(`echo $(which ultra)`);
const CREATETS = exec(`echo $(which create-ts)`);
const PM = ULTRA ? "ultra" : PNPM ? "pnpm" : YARN ? "yarn" : "npm";

const JQ = exec(`echo $(which jq)`);
const GIT = exec(`echo $(which git)`);
const NPM = Number(exec(`echo $(npm --version)`).split(".")[0]);

if (existsSync(NAME)) {
  console.log(`La carpeta ${color("red", NAME)} ya existe... Bórrala si quieres crear un proyecto nuevo`);
  process.exit(-1);
}

if (!JQ) {
  console.log(`${color("red", "jq")} not detected. Install with ${color("yellow", "sudo apt-get install jq")}`);
  process.exit(-2);
}

if (!GIT) {
  console.log(`${color("red", "git")} not detected. Install with ${color("yellow", "sudo apt-get install git")}`);
}

const isFront = ARGS.includes("--phaser");
const isBack = ARGS.includes("--lit");

if (NPM < 7) {
  console.log(`${color("red", "npm 7")} is required. Install with ${color("yellow", "npm install -g npm")}`);
  process.exit(-4);
}

if (NAME === "--version") {
  console.log(VERSION);
  process.exit(0);
}

if (NAME && NAME.indexOf("--") === 0) {
  console.log(`Sintaxis:`);
  console.log(`create-ts <nombre-carpeta> [options]       Crea un proyecto web.\n`);
  console.log(`${color("red", "Error")}: Escribe primero el nombre de la carpeta y los parámetros al final.`);
  process.exit(0);
}

try {
  accessSync(".", constants.R_OK | constants.W_OK);
} catch {
  console.log(`No tienes ${color("red", "permisos")} para escribir en la carpeta actual.`);
  process.exit(-5);
}

console.log(`[${color("yellow", "1")}/3] Iniciando ${color("green", `${NAME}`)}...`);
exec(`mkdir ${NAME}`);
process.chdir(NAME);
exec(`ultra init ${NAME} -y`);

console.log(`[${color("yellow", "2")}/3] Creando ${color("cyan", "estructura de carpetas")}...`);


GIT && exec(`git init`);
exec(`cat >apackage.json << EOF
{
	"scripts": {
    "start:prod": "npm run build && node dist/index.js",
    "dev": "nodemon src/server.js",
		"build": "tsc",
    "start": "nodemon dist/index.ts",
    "test": "echo \"Error: no test specified\" && exit 1",
	},
	"keywords": [],
	"license": "ISC"
}
EOF
`);

exec("mkdir .vscode");
exec(`cat >.vscode/settings.json << EOF
// updated 2022-03-08 07:16
// https://github.com/antfu/vscode-file-nesting-config
{
  "explorer.experimental.fileNesting.enabled": true,
  "explorer.experimental.fileNesting.expand": false,
  "explorer.experimental.fileNesting.patterns": {
    ".gitignore": ".gitattributes, .gitmodules, .gitmessage, .mailmap, .git-blame*",
    "*.js": "\\$(capture).js.map, \\$(capture).min.js, \\$(capture).d.ts",
    "*.jsx": "\\$(capture).js",
    "*.ts": "\\$(capture).js, \\$(capture).*.ts",
    "*.tsx": "\\$(capture).ts",
    "index.d.ts": "*.d.ts",
    "shims.d.ts": "*.d.ts",
    "go.mod": ".air*, go.sum",
    ".env": "*.env, .env*, env.d.ts",
    "dockerfile": ".dockerignore, dockerfile*",
    "package.json": ".browserslist*, .circleci*, .codecov, .commitlint*, .editorconfig, .eslint*, .flowconfig, .gitlab*, .gitpod*, .huskyrc*, .jshintrc, .markdownlint*, .mocha*, .node-version, .nodemon*, .npm*, .nvmrc, .pm2*, .pnpm*, .prettier*, .releaserc*, .sentry*, .stackblitz*, .stylelint*, .tazerc*, .textlint*, .travis*, .vscode*, .watchman*, .yamllint*, .yarnrc*, api-extractor.json, appveyor*, ava.config.*, azure-pipelines*, build.config.*, commitlint*, crowdin*, cypress.json, dangerfile*, gulp*, jasmine.*, jenkins*, jest.config.*, jsconfig.*, karma*, lerna*, lint-staged*, nest-cli.*, netlify*, nodemon*, nx.*, package-lock.json, playwright.config.*, pm2.*, pnpm*, prettier*, pullapprove*, puppeteer.config.*, renovate*, rollup.config.*, stylelint*, tsconfig.*, tsdoc.*, tslint*, tsup.config.*, turbo*, vercel*, vetur.config.*, vitest.config.*, webpack.config.*, workspace.json, yarn*",
    "readme.md": "authors, backers.md, changelog*.md, code_of_conduct.md, codeowners, contributing.md, contributors, copying, credits, governance.md, history.md, license*, maintainers, readme*, security.md, sponsors.md",
    "cargo.toml": "cargo.lock, rust-toolchain.toml, rustfmt.toml",
    "gemfile": ".ruby-version, gemfile.lock",
    "vite.config.*": "*.env, .babelrc, .codecov, .env*, .mocha*, .postcssrc.*, api-extractor.json, ava.config.*, babel.config.*, cypress.json, env.d.ts, index.html, jasmine.*, jest.config.*, jsconfig.*, karma*, playwright.config.*, postcss.config.*, puppeteer.config.*, svgo.config.*, tailwind.config.*, tsconfig.*, tsdoc.*, unocss.config.*, vitest.config.*, webpack.config.*, windi.config.*",
    "vue.config.*": "*.env, .babelrc, .codecov, .env*, .mocha*, .postcssrc.*, api-extractor.json, ava.config.*, babel.config.*, cypress.json, env.d.ts, jasmine.*, jest.config.*, jsconfig.*, karma*, playwright.config.*, postcss.config.*, puppeteer.config.*, svgo.config.*, tailwind.config.*, tsconfig.*, tsdoc.*, unocss.config.*, vitest.config.*, webpack.config.*, windi.config.*",
    "nuxt.config.*": "*.env, .babelrc, .codecov, .env*, .mocha*, .postcssrc.*, api-extractor.json, ava.config.*, babel.config.*, cypress.json, env.d.ts, jasmine.*, jest.config.*, jsconfig.*, karma*, playwright.config.*, postcss.config.*, puppeteer.config.*, svgo.config.*, tailwind.config.*, tsconfig.*, tsdoc.*, unocss.config.*, vitest.config.*, webpack.config.*, windi.config.*",
    "next.config.*": "*.env, .babelrc, .codecov, .env*, .mocha*, .postcssrc.*, api-extractor.json, ava.config.*, babel.config.*, cypress.json, env.d.ts, jasmine.*, jest.config.*, jsconfig.*, karma*, next-env.d.ts, playwright.config.*, postcss.config.*, puppeteer.config.*, svgo.config.*, tailwind.config.*, tsconfig.*, tsdoc.*, unocss.config.*, vitest.config.*, webpack.config.*, windi.config.*",
    "svelte.config.*": "*.env, .babelrc, .codecov, .env*, .mocha*, .postcssrc.*, api-extractor.json, ava.config.*, babel.config.*, cypress.json, env.d.ts, jasmine.*, jest.config.*, jsconfig.*, karma*, playwright.config.*, postcss.config.*, puppeteer.config.*, svgo.config.*, tailwind.config.*, tsconfig.*, tsdoc.*, unocss.config.*, vitest.config.*, webpack.config.*, windi.config.*",
    "remix.config.*": "*.env, .babelrc, .codecov, .env*, .mocha*, .postcssrc.*, api-extractor.json, ava.config.*, babel.config.*, cypress.json, env.d.ts, jasmine.*, jest.config.*, jsconfig.*, karma*, playwright.config.*, postcss.config.*, puppeteer.config.*, remix.*, svgo.config.*, tailwind.config.*, tsconfig.*, tsdoc.*, unocss.config.*, vitest.config.*, webpack.config.*, windi.config.*"
  }
}
EOF
`);

// exec(`jq -s '.[0] * .[1]' package.json apackage.json >package2.json`);
// exec("rm apackage.json package.json");
// exec("mv package2.json package.json");

exec("mkdir -p src");
exec("touch src/index.ts");

exec(`cat >.eslintrc.cjs << EOF
module.exports = {
  env: {
    browser: false
  },
  extends: [
    "@cowcoders/eslint-config/ts"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "comma-dangle": ["error", "only-multiline"],
    "space-before-function-paren": ["error", "never"]
  }
};
EOF
`);

exec(`cat >tsconfig.json << EOF
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Node 18",
  "compilerOptions": {
    "target": "ES6",                                 
    "module": "CommonJS",                                
    "rootDir": "src",                                  
    "moduleResolution": "node",                       
    "outDir": "dist",                                  
    "esModuleInterop": true,                            
    "forceConsistentCasingInFileNames": true,            
    "strict": true,                                      
    "skipLibCheck": true                                 
  }
}
EOF
`);

exec(`cat >.env << EOF
PORT=3000
EOF
`);

exec(`cat >src/server.js << EOF
import express from "express";
import cors from "cors";

const app = express().use(express.json());



app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});

EOF
`);


const DEVDEP = [
  "eslint", "eslint-plugin-import", "eslint-plugin-n@14.0.0", "eslint-plugin-promise", "eslint-config-standard@17.0.0-1",
  "typescript", "nodemon", "@cowcoders/eslint-config", "@types/express", "@types/node",
  "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", "eslint-config-next"
];

const DEP = ["express", "dotenv", "cors"];

console.log(`[${color("yellow", "3")}/3] Instalando ${color("magenta", "dependencias")}...`);
if (DEP.length > 0) {
  const PACKAGES = DEP.join(" ");
  exec(`npx add-dependencies ${PACKAGES} 2>/dev/null`);
}

const DEVPACKAGES = DEVDEP.join(" ");
exec(`npx add-dependencies ${DEVPACKAGES} --dev 2>/dev/null`);

console.log(`\n¡${color("green", "Listo")}! Para empezar, escribe:

cd ${NAME}
git remote add origin <repo>
${PM} install
${PM} run dev`);
