import mongodb from 'mongodb';
import config from '../config.json';

// Set the configuration context based on execution environment
const context = process.env.NODE_ENV === 'prod' ?
config.prod.database : config.dev.database;

// Get the remote database info from configuration file
const {host, username, password, dbName} = context;
const url = `mongodb+srv://${username}:${password}@${host}/myFirstDatabase?retryWrites=true&w=majority`;

// Create the database client
const client = new mongodb.MongoClient(url,
    {useNewUrlParser: true, useUnifiedTopology: true});

let db = null;
/**
 * Get the established databse connection
 * @return {object} database connection
 */
async function getDB() {
  if (db) {
    return db;
  }

  console.log('connected successfully to server');
  db = (await (client.connect())).db(dbName);
  return db;
}


export default getDB;
