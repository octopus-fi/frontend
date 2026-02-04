import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, SHARED_OBJECTS, ADMIN_CAPS } from '../constants';

export interface RegisterStrategyParams {
    /** Name of the strategy */
    name: string;
    /** Walrus Blob ID containing the strategy JSON */
    blobId: string;
    /** Registry object ID (optional, uses default from constants) */
    registryId?: string;
    /** Admin Cap object ID (optional, uses default from constants) */
    adminCapId?: string;
}

/**
 * Build transaction to register a new strategy in the registry
 * Requires the sender to own the RegistryAdminCap
 */
export function buildRegisterStrategyTransaction({
    name,
    blobId,
    registryId = SHARED_OBJECTS.REGISTRY_ID,
    adminCapId = ADMIN_CAPS.REGISTRY_ADMIN_CAP,
}: RegisterStrategyParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
        target: `${PACKAGE_ID}::strategy_registry::register_strategy`,
        arguments: [
            tx.object(adminCapId),
            tx.object(registryId),
            tx.pure.string(name),
            tx.pure.string(blobId),
        ],
    });

    return tx;
}
