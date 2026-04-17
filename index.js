import express from "express";
import bootstarp from "./src/app.controller.js";
import chalk from "chalk";
const app = express();
const port = process.env.PORT || 8000;

await bootstarp(app, express);
app.listen(port, () =>
  console.log(chalk.blue.bgRed.bold(`Example app listening on port ${port}!`))
);
