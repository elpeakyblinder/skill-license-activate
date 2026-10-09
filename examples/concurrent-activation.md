# Synthetic scenario: last seat and lost response

[Español](activacion-concurrente.md) | [Lifecycle guide](../skill-license-activate/references/lifecycle-and-recovery.md)

## Context

An installed application uses signed temporary authorizations. A synthetic license has one available seat, and its term starts on first activation. Two devices submit distinct intents while one loses its response to a timeout.

This is a proposed reproduction, not a production record or evidence of tests run by this guide. A and B are example labels, not credentials.

## Risk

Separate `count` and `insert` operations without serializing the decision may admit both devices. A fresh intent on every timeout may duplicate effects or restart the term. Looking up results using only a known identifier may expose another tenant's activation.

## Operation to trace

Commercial credential -> stable intent -> scope validation -> atomic reservation/completion -> signed document -> client persistence -> usage decision.

Before issuance, the authority sets one term and verifies commercial status and capacity. The result is bound to intent, subject and scope. A timeout does not prove the server failed to complete.

## Proposed tests

| Test | Expected result |
| --- | --- |
| A and B compete for the last seat | Available capacity is not exceeded |
| A retries its completed intent | Result recovered without a second activation |
| A reuses idempotency with a different body | Conflict without new rights |
| Another tenant looks up A's intent | Rejection without revealing results or changing capacity |
| Client verifies response but persistence fails | No durable success reported; recovery remains possible |
| License is revoked while issuance is pending | Defined policy and concurrency ordering apply |

Run races on isolated storage with the authority's guarantees. Check persisted data, issued document and post-restart state in addition to HTTP. Include a permitted case to detect fixes that block every activation.

## Limitations and evidence

Repository maintenance tests do not execute these scenarios. Record language, storage engine, version, sequence, result and environment when reproducing them. Do not include proprietary contracts, credentials, real signed documents or source-product details in a report.
