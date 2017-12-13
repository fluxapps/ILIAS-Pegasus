import {ConnectionOptions, ConnectionOptionsReader, createConnection} from "typeorm";

const ORM_CONFIG: {"root": string; "configName": string} = {
  root: "assets/",
  configName: "ormconfig.json"
};

export const CONNECTION_NAME: string = "ilias-pegasus";

/**
 * Creates the typeORM connection by reading the orm config file.
 */
export async function setupConnection(): Promise<void> {
  const connectionOptionsReader: ConnectionOptionsReader = new ConnectionOptionsReader(ORM_CONFIG);
  const connectionOptions: ConnectionOptions = await connectionOptionsReader.get(CONNECTION_NAME);

  await createConnection(connectionOptions)
}
