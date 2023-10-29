const { app, BrowserWindow, ipcMain } = require("electron");
const initSqlJs = require("sql.js");
const reader = require("xlsx");
const fs = require("fs");
const path = require("node:path");

let filebuffer = fs.readFileSync("./database.db");
let db;

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
  db = new SQL.Database(filebuffer);

  // const stmt = db.prepare('SELECT * FROM "Complex"');
  // while (stmt.step()) console.log(stmt.get());
});

function insertData(filePath) {
  let file = reader.readFile(filePath);
  let data = [];

  const columnNames = reader.utils.sheet_to_json(
    file.Sheets[file.SheetNames[0]],
    { header: 1 }
  )[0];

  const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
  temp.forEach((res) => {
    data.push(res);
  });

  const insertPersonSQL = `
      INSERT INTO "Person" (surname, name, am, department, phone, phoneSecondary, mail, room) 
      VALUES (:surname, :name, :am, :department, :phone, :phoneSecondary, :mail, :room);
    `;

  const insertRoomSQL = `
      INSERT INTO "Room" (id, number, belongsToComplex, belongsToBuilding, type, phone, lan) 
      VALUES (:id, :number, :belongsToComplex, :belongsToBuilding, :type, :phone, :lan);
    `;

  const stmtPerson = db.prepare(insertPersonSQL);
  const stmtRoom = db.prepare(insertRoomSQL);

  for (const line of data) {
    stmtRoom.bind({
      ":id": line[columnNames[0]],
      ":number": line[columnNames[3]],
      ":belongsToComplex": Math.floor((line[columnNames[0]] - 1) / 60) + 1,
      ":belongsToBuilding": Math.floor((line[columnNames[0]] - 1) / 30) + 1,
      ":type": line[columnNames[4]],
      ":phone": String(line[columnNames[5]]),
      ":lan": line[columnNames[6]],
    });
    stmtRoom.step();
    stmtRoom.reset();

    stmtPerson.bind({
      ":surname": line[columnNames[7]],
      ":name": line[columnNames[8]],
      ":am": String(line[columnNames[9]]),
      ":department": line[columnNames[10]],
      ":phone": String(line[columnNames[11]]),
      ":phoneSecondary": String(line[columnNames[12]]),
      ":mail": line[columnNames[13]],
      ":room": line[columnNames[0]],
    });
    stmtPerson.step();
    stmtPerson.reset();
  }
}
