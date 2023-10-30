const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const initSqlJs = require("sql.js");
const reader = require("xlsx");
const fs = require("fs");
const path = require("node:path");

let filebuffer = fs.readFileSync("./database.db");
let db;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1012,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // To disable the menu
  const customMenu = Menu.buildFromTemplate([]);
  Menu.setApplicationMenu(customMenu);

  win.loadFile("select_file.html");

  ipcMain.on("file-selected", (event, filePath) => {
    insertData(filePath);
    win.loadFile("map.html");
  });

  ipcMain.on("room-selected", (event, roomId) => {
    console.log(fetchPeople(roomId));
  });
};

app.whenReady().then(() => {
  createWindow();
});

initSqlJs().then(function (SQL) {
  // Load the db
  db = new SQL.Database(filebuffer);
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

function fetchPeople(roomId) {
  const stmt = db.prepare('SELECT * FROM "Person" WHERE room = :roomId;');
  stmt.bind({ ":roomId": roomId });

  const people = [];
  while (stmt.step()) people.push(new Person(stmt.get()));

  return people;
}

class Person {
  constructor(data) {
    this.id = data[0];
    this.surname = data[1];
    this.name = data[2];
    this.am = data[3];
    this.department = data[4];
    this.phone = data[5];
    this.phoneSecondary = data[6];
    this.mail = data[7];
    this.roomId = data[9];
  }
}
