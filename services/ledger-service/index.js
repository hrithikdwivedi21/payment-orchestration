const eventBus = require("./shared/eventBus");
const pool = require("./shared/db");
const { v4: uuidv4 } = require("uuid");

async function start(){

 await eventBus.connect();

 eventBus.subscribe("ledger",async data=>{

   await pool.query(
   `INSERT INTO ledger_entries
    VALUES($1,$2,$3,$4,$5,$6,now())`,
   [
     uuidv4(),
     data.walletId,
     data.type,
     data.amount,
     data.currency,
     data.referenceId
   ]);

 });

}

start();