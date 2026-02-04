
import { SuiClient } from '@mysten/sui/client';

// Replace with actual values from user's environment/logs if possible, 
// but for now we'll just use the RPC to inspect the object ID if the user provides it.
// Or we blindly inspect the shared objects.

const RPC_URL = 'https://fullnode.testnet.sui.io:443';
const client = new SuiClient({ url: RPC_URL });

const STAKE_POSITION_ID = process.argv[2];

async function main() {
    if (!STAKE_POSITION_ID) {
        console.error("Please provide a Stake Position ID as an argument.");
        process.exit(1);
    }

    console.log(`Inspecting StakePosition: ${STAKE_POSITION_ID}`);

    const object = await client.getObject({
        id: STAKE_POSITION_ID,
        options: { showContent: true, showOwner: true }
    });

    if (object.error) {
        console.error("Error fetching object:", object.error);
        return;
    }

    console.log("Object Owner:", object.data?.owner);
    console.log("Object Content:", JSON.stringify(object.data?.content, null, 2));

    // Check if it is shared
    const owner = object.data?.owner as any;
    if (owner && owner.Shared) {
        console.log("Status: SHARED. This matches expected contract behavior.");
    } else if (owner && owner.AddressOwner) {
        console.log("Status: OWNED. This might be why the wallet shows 'Owner: you'.");
        console.log("Is the contract actually sharing the object in key functions?");
    }
}

main().catch(console.error);
