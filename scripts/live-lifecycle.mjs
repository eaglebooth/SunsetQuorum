import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const address = process.env.CONTRACT_ADDRESS;
const key = (name) => { const v=process.env[name]; if(!v) throw new Error(`Missing ${name}`); return v.startsWith("0x")?v:`0x${v}`; };
if(!/^0x[0-9a-fA-F]{40}$/.test(address||"")) throw new Error("Invalid CONTRACT_ADDRESS");
const alpha=createAccount(key("ALPHA_PRIVATE_KEY")), beta=createAccount(key("BETA_PRIVATE_KEY"));
const clients={alpha:createClient({chain:studionet,account:alpha}),beta:createClient({chain:studionet,account:beta})};
const controller=alpha.address, service="sunset-demo-api", revision=1n;
const terms="b65a0b4d362f104dac887e33f143a0550fbfc079f7773f7a753f6c79a02ea0e2";
const shutdown="9fcf6f08a57f25bcf905d7fc25694581baae17ed1f30c08d25f43ba994dac6e7";
const evidence={
 alpha:["https://raw.githubusercontent.com/eaglebooth/PatchProof/eb7f5b6f9d8df88c34c7263930b4b8f3f7595ea4/SUNSETQUORUM_CONSUMER_ALPHA.md","cd299840e5776a173e001415df332ed30966dbe3a0ed92865877d8a10d0cd08f",1243n,"alpha-live-20260924"],
 beta:["https://raw.githubusercontent.com/eaglebooth/ClaimAnchor/51ff6680f8c2ee876d5cbaf382602be1af13ad82/SUNSETQUORUM_CONSUMER_BETA.md","34316aa978efdc738028c341af50f3b3f57e665fd62aef6eecdcb6812b9cdbda",1291n,"beta-live-20260924"],
};
const read=async(name,args=[])=>JSON.parse(await clients.alpha.readContract({address,functionName:name,args}));
const transact=async(label,client,name,args,expectSuccess=true)=>{
 const hash=await client.writeContract({address,functionName:name,args,value:0n});console.log(JSON.stringify({label,hash,phase:"submitted"}));
 const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,interval:2000,retries:300});
 const tx=await client.getTransaction({hash});const leader=tx.consensus_data?.leader_receipt?.[0];
 const result=tx.result_name??tx.resultName??receipt.resultName??"";const execution=leader?.execution_result??tx.txExecutionResultName??receipt.txExecutionResultName??"";
 const ok=(tx.statusName??receipt.statusName)==="FINALIZED"&&["MAJORITY_AGREE","AGREE"].includes(result)&&["SUCCESS","FINISHED_WITH_RETURN"].includes(execution);
 console.log(JSON.stringify({label,hash,status:tx.statusName??receipt.statusName,result,execution,expected:expectSuccess?"SUCCESS":"REVERT",observed:ok?"SUCCESS":"REVERT"}));
 if(ok!==expectSuccess)throw new Error(`${label}: unexpected outcome`);return hash;
};

console.log(JSON.stringify({contract:address,controller,operator:beta.address,revision:await read("get_revision",[controller,service,revision])},null,2));
let ca=await read("get_consumer",[controller,service,revision,"consumer-alpha"]);
if(ca.status==="REGISTERED")await transact("alpha_consent",clients.alpha,"consent",[controller,service,revision,"consumer-alpha",terms]);
ca=await read("get_consumer",[controller,service,revision,"consumer-alpha"]);
if(ca.status==="CONSENTED")await transact("alpha_submit_evidence",clients.alpha,"submit_evidence",[controller,service,revision,"consumer-alpha",...evidence.alpha]);
ca=await read("get_consumer",[controller,service,revision,"consumer-alpha"]);
if(ca.status==="EVIDENCE_SUBMITTED")await transact("alpha_assess",clients.alpha,"assess_consumer",[controller,service,revision,"consumer-alpha"]);
let cb=await read("get_consumer",[controller,service,revision,"consumer-beta"]);
if(cb.status!=="READY")await transact("early_shutdown_rejected",clients.beta,"execute_shutdown",[controller,service,revision,shutdown,"early-beta-20260924"],false);
if(cb.status==="REGISTERED")await transact("beta_consent",clients.beta,"consent",[controller,service,revision,"consumer-beta",terms]);
cb=await read("get_consumer",[controller,service,revision,"consumer-beta"]);
if(cb.status==="CONSENTED")await transact("beta_submit_evidence",clients.beta,"submit_evidence",[controller,service,revision,"consumer-beta",...evidence.beta]);
cb=await read("get_consumer",[controller,service,revision,"consumer-beta"]);
if(cb.status==="EVIDENCE_SUBMITTED")await transact("beta_assess",clients.beta,"assess_consumer",[controller,service,revision,"consumer-beta"]);
let state=await read("get_revision",[controller,service,revision]);
if(state.authorized&&!state.consumed)await transact("wrong_actor_shutdown_rejected",clients.alpha,"execute_shutdown",[controller,service,revision,shutdown,"wrong-actor-20260924"],false);
state=await read("get_revision",[controller,service,revision]);
if(state.authorized&&!state.consumed)await transact("shutdown_execute",clients.beta,"execute_shutdown",[controller,service,revision,shutdown,"execute-beta-20260924"]);
state=await read("get_revision",[controller,service,revision]);
if(state.consumed)await transact("double_consume_rejected",clients.beta,"execute_shutdown",[controller,service,revision,shutdown,"double-beta-20260924"],false);
console.log(JSON.stringify({final_revision:await read("get_revision",[controller,service,revision]),alpha:await read("get_consumer",[controller,service,revision,"consumer-alpha"]),beta:await read("get_consumer",[controller,service,revision,"consumer-beta"]),stats:await read("get_stats")},null,2));
