import mongodb from 'mongodb';
import config from '../config.json';

const {host, username, password} = config.dev.database;
const url = `mongodb+srv://${username}:${password}@${host}/myFirstDatabase?retryWrites=true&w=majority`;

const client = new mongodb.MongoClient(url,
    {useNewUrlParser: true, useUnifiedTopology: true});

client.connect((err) => {
  console.log('connected successfully to server');
});

export default client;
