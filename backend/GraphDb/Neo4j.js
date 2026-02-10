import neo4j from "neo4j-driver";
import dotenv from "dotenv";
dotenv.config();

export let NeoGraphdriver;
const ConnectToInstance = async () => {
  NeoGraphdriver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const serverInfo = await NeoGraphdriver.getServerInfo();

  console.log("Connection established withe the graph db");
  // console.log(serverInfo);

  // await driver.close()
};
// start the connection on server start
// await ConnectToInstance();
