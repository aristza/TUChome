const { app, BrowserWindow } = require("electron");
const initSqlJs = require("sql.js");
const reader = require("xlsx");
const fs = require("fs");

let filebuffer = fs.readFileSync("./database.db");

const file = reader.readFile("./TUCres.xlsx");
let data = [];

const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
temp.forEach((res) => {
  data.push(res);
});

const createWindow = () => {
  const win = new BrowserWindow({
    width: 980,
    height: 600,
  });

  win.loadFile("load_file.html");
};

app.whenReady().then(() => {
  createWindow();
});

initSqlJs().then(function (SQL) {
  // Load the db
  const db = new SQL.Database(filebuffer);

  const stmt = db.prepare('SELECT * FROM "Complex"');
  while (stmt.step()) console.log(stmt.get());
});
