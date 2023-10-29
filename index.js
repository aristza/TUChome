const { app, BrowserWindow, ipcMain } = require("electron");
const initSqlJs = require("sql.js");
const reader = require("xlsx");
const fs = require("fs");
const path = require("node:path");

let filebuffer = fs.readFileSync("./database.db");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 980,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("select_file.html");

  ipcMain.on("file-selected", (event, filePath) => {
    insertData(filePath);
    win.loadFile("map.html");
  });
};

app.whenReady().then(() => {
  createWindow();
});

initSqlJs().then(function (SQL) {
  // Load the db
  const db = new SQL.Database(filebuffer);

  // const stmt = db.prepare('SELECT * FROM "Complex"');
  // while (stmt.step()) console.log(stmt.get());
});

function insertData(filePath) {
  let file = reader.readFile(filePath);
  let data = [];

  const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
  temp.forEach((res) => {
    data.push(res);
  });

  console.log(data);
}
