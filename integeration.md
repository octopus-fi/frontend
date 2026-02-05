# Frontend Integration Guide - Contract Changes

> **Last Updated**: 2026-02-05  
> **Package ID**: `0xae626bc0bdfed830ed0fdb532613af7ce6abf067b819a0d48815ccbae5c1384c`

---

## 🚨 Breaking Change: Clock Parameter Required

All staking-related functions now require the **Sui Clock object** (`0x6`) for accurate timestamp-based reward calculations.

---

## Function Signature Changes

### 1. `liquid_staking::initialize_staking_pool`

```diff
- public fun initialize_staking_pool<T>(treasury_cap, ctx)
+ public fun initialize_staking_pool<T>(treasury_cap, clock, ctx)
```

**New Parameter:**
| Name | Type | Value |
|------|------|-------|
| `clock` | `&Clock` | `0x6` (shared object) |

---

### 2. `liquid_staking::stake`

```diff
- public fun stake<T>(pool, coin, ctx)
+ public fun stake<T>(pool, coin, clock, ctx)
```

**Frontend Transaction Builder:**
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::liquid_staking::stake`,
  typeArguments: [`${PACKAGE_ID}::mocksui::MOCKSUI`],
  arguments: [
    tx.object(STAKING_POOL_ID),
    tx.object(coinToStake),
    tx.object('0x6'),  // ← ADD THIS
  ],
});
```

---

### 3. `liquid_staking::claim_rewards`

```diff
- public fun claim_rewards<T>(pool, position, ctx)
+ public fun claim_rewards<T>(pool, position, clock, ctx)
```

**Frontend Transaction Builder:**
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::liquid_staking::claim_rewards`,
  typeArguments: [`${PACKAGE_ID}::mocksui::MOCKSUI`],
  arguments: [
    tx.object(STAKING_POOL_ID),
    tx.object(stakePositionId),
    tx.object('0x6'),  // ← ADD THIS
  ],
});
```

---

### 4. `liquid_staking::get_pending_rewards` (View Function)

```diff
- public fun get_pending_rewards<T>(pool, position)
+ public fun get_pending_rewards<T>(pool, position, clock)
```

**Frontend Call:**
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::liquid_staking::get_pending_rewards`,
  typeArguments: [`${PACKAGE_ID}::mocksui::MOCKSUI`],
  arguments: [
    tx.object(STAKING_POOL_ID),
    tx.object(stakePositionId),
    tx.object('0x6'),  // ← ADD THIS
  ],
});
```

---

## Unchanged Functions (No Clock Needed)

These functions do **NOT** require Clock:

| Module | Function |
|--------|----------|
| `liquid_staking` | `unstake` |
| `liquid_staking` | `enable_auto_rebalance` |
| `liquid_staking` | `disable_auto_rebalance` |
| `vault_manager` | `create_vault` |
| `vault_manager` | `deposit_collateral` |
| `vault_manager` | `withdraw_collateral` |
| `vault_manager` | `borrow` |
| `vault_manager` | `repay` |
| `liquidation` | `liquidate` |
| `oracle_adapter` | `get_price` |

---

## New Reward Rate

Staking rewards now accrue at:

| Rate | Interval |
|------|----------|
| **5 SUI** | per 6 hours |
| **1,157,407** | per 5-second interval (scaled by 1e9) |

Rewards accrue in real-time based on `clock::timestamp_ms()`.

---

## Deployed Addresses

```env
PACKAGE_ID=0xae626bc0bdfed830ed0fdb532613af7ce6abf067b819a0d48815ccbae5c1384c
STAKING_POOL_ID=0xc0a81ef86073e0a362df9a98665c81a81811941036afcec5b8cfc6ee04de717c
ORACLE_ID=0xfbb40f07f6533f4fdabf7ca2cde87ad119aa0569f633cb46ac4e617858ba5503
BANK_ID=0x3992d03479166520d7d30887b094a4e94ec8bd05d00028ab76e2159575b4ae9e
VAULT_REGISTRY_ID=0x08a3e88630d7637258fd59e6c72cf3acd2ab1bc0e61d2442c0eb107524515262
CLOCK_ID=0x6
```

---

## Example: Complete Stake Transaction

```typescript
import { Transaction } from '@mysten/sui/transactions';

const CLOCK = '0x6';

async function stakeTokens(amount: string) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::liquid_staking::stake`,
    typeArguments: [`${PACKAGE_ID}::mocksui::MOCKSUI`],
    arguments: [
      tx.object(STAKING_POOL_ID),
      tx.object(coinObjectId),
      tx.object(CLOCK),  // Required!
    ],
  });

  return tx;
}
```

---

## Example: Claim Rewards Transaction

```typescript
async function claimRewards(stakePositionId: string) {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::liquid_staking::claim_rewards`,
    typeArguments: [`${PACKAGE_ID}::mocksui::MOCKSUI`],
    arguments: [
      tx.object(STAKING_POOL_ID),
      tx.object(stakePositionId),
      tx.object('0x6'),  // Required!
    ],
  });

  return tx;
}
```

---

## Questions?

Contact the smart contract team for clarification.
