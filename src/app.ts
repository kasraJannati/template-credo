import express from 'express';
import {
  HttpOutboundTransport,
  Agent,
  LogLevel,
  WsOutboundTransport,
  ConsoleLogger,
  DidCreateOptions,
  KeyType,
} from '@credo-ts/core';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';
import { AskarModule } from '@credo-ts/askar';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import { SQLWalletModule } from './wallet/SQLWalletModule';
import fs from 'fs/promises'; // Import the promises API

const app = express();

async function run() {
  const holder = new Agent({
    config: {
      label: 'holder',
      walletConfig: {
        id: 'holder',
        key: 'holder',
      },
      logger: new ConsoleLogger(LogLevel.debug),
      endpoints: ['http://0.0.0.0:3002'],
    },
    dependencies: agentDependencies,
    modules: {
      // askar: new AskarModule({
      //   ariesAskar,
      // }),
      SQL: new SQLWalletModule(),
    },
  });

  holder.registerOutboundTransport(new HttpOutboundTransport());
  holder.registerOutboundTransport(new WsOutboundTransport());
  holder.registerInboundTransport(new HttpInboundTransport({ port: 3002 }));
  await holder.initialize();
  const doc: any = {};

  const generateFile = async () => {
    try {
      // Await the readFile function
      const response = await fs.readFile('./resolved_dids_new.json', 'utf8');
      const data = JSON.parse(response);
      console.log('teesssssssss');

      for (let i = 0; i < data.length; i++) {
        const didCreateOptions: DidCreateOptions = {
          didDocument: data[i].did_document,
          method: 'peer',
          options: {
            keyType: KeyType.Ed25519,
            numAlgo: 0,
          },
        };
        const result = await holder.dids.create(didCreateOptions);
        doc[data[i].did_document.id] = result;
      }

      console.log('docdocdocdocdocdoc', doc, 'docdocdoc');

      // Await the writeFile function
      await fs.writeFile('./credo_dids_new.json', JSON.stringify(doc));
    } catch (err) {
      console.error(err);
    }
  };

  await generateFile();
  console.log('!@@@@@');

  const connections = await holder.connections.getAll();
  console.log(connections, 'connections');
  // await holder.oob.receiveInvitationFromUrl(
  //   'http://0.0.0.0:8037?c_i=eyJAdHlwZSI6ICJodHRwczovL2RpZGNvbW0ub3JnL2Nvbm5lY3Rpb25zLzEuMC9pbnZpdGF0aW9uIiwgIkBpZCI6ICIwNGQ0YzkxMy1lODc1LTRhMmMtOTc1ZS1jNGZiYTRmMjk4MDEiLCAibGFiZWwiOiAidGVzdC5hZ2VudCIsICJyZWNpcGllbnRLZXlzIjogWyI2OWc5MTZZWktOTjFVZ3U5OG44eXFoVzJSejNvaVNuc3ViMlJGWGtCcm5ZWCJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly8wLjAuMC4wOjgwMzcifQ==',
  // );
  await holder.basicMessages.sendMessage(
    '4226879c-dc70-4894-a714-c743229c101d',
    'This is test!!!',
  );
}

try {
  void run();
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
} catch (e) {
  void run();
}
