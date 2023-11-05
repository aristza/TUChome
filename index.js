const { app, BrowserWindow, ipcMain, Menu } = require("electron");
// const drag = require("electron-drag");
const initSqlJs = require("sql.js");
const reader = require("xlsx");
const fs = require("fs");
const path = require("node:path");
const { log } = require("console");

let filebuffer = fs.readFileSync("misc/database.db");
let db;
let win;
let complex = 0;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1600,
    height: 980,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "scripts/preload.js"),
      nodeIntegration: true,
    },
  });

  navigateToNewPage("html/select_file.html");
};

ipcMain.on("file-selected", (event, filePath) => {
  insertData(filePath);
  navigateToNewPage("html/map.html");
});

ipcMain.on("occupancy-requested", () => {
  win.webContents.send("occupancy-list", calculateOccupancy());
});

ipcMain.on("room-selected", (event, roomId) => {
  win.webContents.send(
    "people-list",
    fetchRoomData(roomId + (complex - 1) * 60)
  );
});

ipcMain.on("win-minimize", () => {
  win.minimize();
});

ipcMain.on("win-maximize", () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on("win-close", () => {
  win.close();
});

ipcMain.on("navigate-map", () => {
  navigateToNewPage("html/map.html");
});

ipcMain.on("navigate-complex", (event, num) => {
  complex = num;
  navigateToNewPage("html/complex.html");
});

var finishedLoadingHandler = function () {
  win.webContents.clearHistory();
  win.webContents.removeListener("did-finish-load", finishedLoadingHandler);
};

// Use this for cacheless navigation
function navigateToNewPage(page) {
  win.loadFile(page);
  win.webContents.on("did-finish-load", finishedLoadingHandler);
}

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
      INSERT INTO "Person" (surname, name, am, department, phone, phoneSecondary, mail, comments, room) 
      VALUES (:surname, :name, :am, :department, :phone, :phoneSecondary, :mail, :comments, :room);
    `;

  const insertRoomSQL = `
      INSERT INTO "Room" (id, number, belongsToComplex, belongsToBuilding, type, phone, lan, comments) 
      VALUES (:id, :number, :belongsToComplex, :belongsToBuilding, :type, :phone, :lan, :comments);
    `;

  const stmtPerson = db.prepare(insertPersonSQL);
  const stmtRoom = db.prepare(insertRoomSQL);

  for (const line of data) {
    if (line.hasOwnProperty(columnNames[0])) {
      stmtRoom.bind({
        ":id": line[columnNames[0]],
        ":number": line[columnNames[3]],
        ":belongsToComplex": Math.floor((line[columnNames[0]] - 1) / 60) + 1,
        ":belongsToBuilding": Math.floor((line[columnNames[0]] - 1) / 30) + 1,
        ":type": line[columnNames[4]],
        ":phone": String(line[columnNames[5]]),
        ":lan": line[columnNames[6]],
        ":comments": line[columnNames[7]],
      });
      stmtRoom.step();
      stmtRoom.reset();
    }

    if (line.hasOwnProperty(columnNames[8])) {
      stmtPerson.bind({
        ":surname": line[columnNames[8]],
        ":name": line[columnNames[9]],
        ":am": String(line[columnNames[10]]),
        ":department": line[columnNames[11]],
        ":phone": String(line[columnNames[12]]),
        ":phoneSecondary": String(line[columnNames[13]]),
        ":mail": line[columnNames[14]],
        ":comments": line[columnNames[15]],
        ":room": line[columnNames[0]],
      });
      stmtPerson.step();
      stmtPerson.reset();
    }

    if (line.hasOwnProperty(columnNames[17])) {
      stmtPerson.bind({
        ":surname": line[columnNames[17]],
        ":name": line[columnNames[18]],
        ":am": String(line[columnNames[19]]),
        ":department": line[columnNames[20]],
        ":phone": String(line[columnNames[21]]),
        ":phoneSecondary": String(line[columnNames[22]]),
        ":mail": line[columnNames[23]],
        ":comments": line[columnNames[24]],
        ":room": line[columnNames[0]],
      });
      stmtPerson.step();
      stmtPerson.reset();
    }
  }
}

function calculateOccupancy() {
  const stmt = db.prepare(`SELECT
  belongsToComplex,
  SUM(
      CASE
          WHEN "Type" = 'Δ' THEN 2
          ELSE 1
      END
  ) AS positions
  FROM "Room"
  GROUP BY belongsToComplex;
  `);

  const stmtOccupancy = db.prepare(`
    SELECT
    CASE
      WHEN room >= 1 AND room <= 60 THEN 1
      WHEN room >= 61 AND room <= 120 THEN 2
      WHEN room >= 121 AND room <= 180 THEN 3
    END as complex, COUNT(*) as occupancy
    FROM "Person" GROUP BY complex;
  `);

  const data = {};
  data["positions"] = {};
  data["occupancy"] = {};
  while (stmt.step()) data["positions"][stmt.get()[0]] = stmt.get()[1];
  while (stmtOccupancy.step())
    data["occupancy"][stmtOccupancy.get()[0]] = stmtOccupancy.get()[1];
  return data;
}

function fetchRoomData(roomId) {
  const stmtRoom = db.prepare('SELECT * FROM "Room" WHERE id = :roomId;');
  stmtRoom.bind({ ":roomId": roomId });
  const stmt = db.prepare('SELECT * FROM "Person" WHERE room = :roomId;');
  stmt.bind({ ":roomId": roomId });

  const data = [];
  if (stmtRoom.step()) data.push(new Room(stmtRoom.get()));
  while (stmt.step()) data.push(new Person(stmt.get()));

  return data;
}

class Room {
  constructor(data) {
    this.id = data[0];
    this.number = data[1];
    this.type = data[4];
    this.phone = data[5];
    this.lan = data[6];
    this.comments = data[7];
  }
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
    this.email = data[7];
    // photo is 8
    this.roomId = data[9];
    this.comments = data[10];
  }
}
