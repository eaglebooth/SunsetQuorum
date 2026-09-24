import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const contract = process.env.CONTRACT_ADDRESS;
const controllerKey = process.env.CONTROLLER_PRIVATE_KEY;
const operatorKey = process.env.OPERATOR_PRIVATE_KEY;
if (!/^0x[0-9a-fA-F]{40}$/.test(contract || "") || !controllerKey || !operatorKey) throw new Error("Missing live configuration");
const key = (value) => value.startsWith("0x") ? value : `0x${value}`;
const controller = createAccount(key(controllerKey));
const operator = createAccount(key(operatorKey));
const controllerClient = createClient({ chain: studionet, account: controller });
const address = contract;
const commit = "52b21b74860980e0b734379b6230c71fdc40f1fa";
const raw = (name) => `https://raw.githubusercontent.com/eaglebooth/SunsetQuorum/${commit}/docs/${name}`;

const read = async (name, args = []) => JSON.parse(await controllerClient.readContract({ address, functionName: name, args }));
const write = async (label, name, args) => {
  const hash = await controllerClient.writeContract({ address, functionName: name, args, value: 0n });
  console.log(JSON.stringify({ label, hash, phase: "submitted" }));
  const receipt = await controllerClient.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 2000, retries: 300 });
  const tx = await controllerClient.getTransaction({ hash });
  const leader = tx.consensus_data?.leader_receipt?.[0];
  const result = tx.result_name ?? tx.resultName ?? receipt.resultName;
  const execution = leader?.execution_result ?? tx.txExecutionResultName ?? receipt.txExecutionResultName;
  console.log(JSON.stringify({ label, hash, status: tx.statusName ?? receipt.statusName, result, execution }));
  if ((tx.statusName ?? receipt.statusName) !== "FINALIZED" || !["MAJORITY_AGREE", "AGREE"].includes(result) || !["SUCCESS", "FINISHED_WITH_RETURN"].includes(execution)) throw new Error(`${label} failed`);
  return hash;
};

console.log(JSON.stringify({ controller: controller.address, operator: operator.address, before: await read("get_stats") }));
let revision = await read("get_revision", [controller.address, "sunset-demo-api", 1n]);
if (!revision.exists) await write("create_revision", "create_revision", [
  "sunset-demo-api", 1n, operator.address, "eaglebooth/sunsetquorum",
  raw("OLD_CAPABILITY.md"), "1b347aa5f78467792ada6daac784b19ed7c22ba53cca91ac6f94da621422bdcb", 520n,
  raw("NEW_CAPABILITY.md"), "74ff59a5fbbfc7038c7caf6d49a3c6e4d31d4a421331404de85a8699f0df018f", 584n,
  raw("MIGRATION_POLICY.md"), "2a1419dce887ebe0b3648ab7807be185c2640eeb1f4993347989c0c605601bef", 925n,
  "9fcf6f08a57f25bcf905d7fc25694581baae17ed1f30c08d25f43ba994dac6e7",
]);
revision = await read("get_revision", [controller.address, "sunset-demo-api", 1n]);
if (Number(revision.consumer_count) < 1) await write("add_consumer_alpha", "add_consumer", [controller.address, "sunset-demo-api", 1n, "consumer-alpha", controller.address, "eaglebooth/patchproof"]);
revision = await read("get_revision", [controller.address, "sunset-demo-api", 1n]);
if (Number(revision.consumer_count) < 2) await write("add_consumer_beta", "add_consumer", [controller.address, "sunset-demo-api", 1n, "consumer-beta", operator.address, "eaglebooth/claimanchor"]);
revision = await read("get_revision", [controller.address, "sunset-demo-api", 1n]);
if (!revision.sealed) await write("seal_revision", "seal_revision", [controller.address, "sunset-demo-api", 1n]);
console.log(JSON.stringify({ revision: await read("get_revision", [controller.address, "sunset-demo-api", 1n]), after: await read("get_stats") }, null, 2));
