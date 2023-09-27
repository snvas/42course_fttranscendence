import { Client, Account } from 'appwrite';

const client: Client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('64f497e62831c223207f');

export const account: Account = new Account(client);
export default client;