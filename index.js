const { app, BrowserWindow } = require('electron')
const initSqlJs = require('sql.js');
// const fs = require('fs');
// const initSqlJs = require('sql-wasm.js');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 980,
    height: 600
  })

  win.loadFile('map.html')
}

app.whenReady().then(() => {
  createWindow()
})

initSqlJs().then(function(SQL){
    // Load the db
    const db = new SQL.Database();
    let sqlstr = "CREATE TABLE hello (a int, b char); \
    INSERT INTO hello VALUES (0, 'hello'); \
    INSERT INTO hello VALUES (1, 'world');";
    db.run(sqlstr);

    const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

    // Bind values to the parameters and fetch the results of the query
    const result = stmt.getAsObject({':aval' : 1, ':bval' : 'world'});
    console.log(result); // Will print {a:1, b:'world'}
  });