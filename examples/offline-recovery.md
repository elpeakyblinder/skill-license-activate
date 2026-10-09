# Synthetic scenario: offline import and lost state

[Español](recuperacion-offline.md) | [Validation](../skill-license-activate/references/validation.md)

## Context

A disconnected application retains a pending request and receives a signed license through an authorized channel. Storage fails during import; afterward, a document for another identity is presented and access to the existing key is lost.

This hypothetical scenario includes no real format, keys, license files or execution results.

## Decisions to preserve

Import checks bounded format, trust, signature, product/environment, request binding, identity, validity and revision before confirming state. The pending request is consumed only after the result is persisted.

Losing a key does not authorize automatic recreation or changing the baseline. Storage failure does not justify an active boolean or an unverified document as fallback. Business data remains available for the defined recovery process.

## Proposed tests

| Test | Expected result |
| --- | --- |
| Valid import and complete persistence | Only verified rights granted; intent resolved |
| Termination before/after durable replacement | Complete old or new state, without mixing them |
| File for another intent or identity | Rejection without replacing current state |
| Same already-completed license import | Idempotent result according to the contract |
| Older revision or equal revision with different content | Rejection or conflict without lowering the checkpoint |
| Existing key unavailable | Explicit recovery; no silent new identity |
| Excessive file or manipulated path | Bounded rejection without execution or writes outside the destination |

Check post-restart state and recovery after storage or permission repair, not just an import method's return value. Use test resources; do not remove real keys to reproduce the case.

## Limitations and evidence

A disconnected client cannot receive immediate remote revocation. Time trust and complete snapshot restoration have limits that must be stated. Neither this example nor package tests certify an offline implementation.

If executed, record platform, key custody, storage, interruption points and results using synthetic data. A documentation correction is not that execution evidence.
