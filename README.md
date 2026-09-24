# SunsetQuorum

Consumer-safe retirement of exact legacy API capabilities on GenLayer. The deployer has no privileged runtime role. A controller wallet defines the old capability, its replacement and required consumer set; registered consumer wallets consent and submit repository-scoped evidence; validators assess each consumer's exact identity-bound migration; the operator can consume the exact retirement capability once only after unanimous readiness.

Studionet contract: [`0xa6770B18d8784Aee27c217D1174799858D915B57`](https://explorer-studio.genlayer.com/address/0xa6770B18d8784Aee27c217D1174799858D915B57) (chain ID 61997).

Live app: [sunsetquorum.vercel.app](https://sunsetquorum.vercel.app) · Live proof: [full Studionet lifecycle](docs/LIVE_STUDIONET_EVIDENCE.md) · [machine-readable deployment](deployments/studionet.json).

## Authority and evidence

- Authority comes from `gl.message.sender_address` plus the on-chain role/repository registry.
- Markdown is bounded evidence, never authority.
- Full Git commit, repository, URL, SHA-256, byte length, consumer identity, revision, nonce and the complete ordered consumer-set digest are bound.
- Terms are complete before consent; consequential edits require a new revision.
- `UNAVAILABLE`, `PARTIAL`, `BLOCKED` and `CONFLICTED` never authorize shutdown.
- The product proves revision-scoped evidence readiness, not continuous production behavior.

## Roles for live testing

- Main wallet: deploy only; no controller, operator or consumer role.
- Test wallet A: controller and one registered consumer.
- Test wallet B: shutdown operator and second registered consumer.

## Verify

```bash
python -m pytest -q -p no:cacheprovider
npm run lint
npm run build
```

Deploy `contracts/sunset_quorum.py` on Studionet, then set `NEXT_PUBLIC_CONTRACT_ADDRESS`. The frontend transaction tracker waits for `FINALIZED`, checks agreed validator execution, and refreshes canonical state.

This product is not a generic protocol compatibility council. Its reusable primitive is the retirement of an exact legacy capability after every named dependent identity consents and independently proves replacement readiness; the downstream effect is a payload-bound, single-use operator capability.
