# Live Studionet Evidence

Network: Studio Next (chain ID `61997`)

Contract: [`0xa6770B18d8784Aee27c217D1174799858D915B57`](https://explorer-studio.genlayer.com/address/0xa6770B18d8784Aee27c217D1174799858D915B57)

The deployer only deployed the contract. Wallet A acted as controller and consumer alpha. Wallet B acted as operator and consumer beta. Both evidence documents are pinned to immutable Git commits and bound to the exact sealed terms digest.

## Live lifecycle

| Transition | Explorer | GenVM | Verified effect |
|---|---|---:|---|
| Deploy contract | [`0x6921277b…ef3a`](https://explorer-studio.genlayer.com/tx/0x6921277b300c1df558d68c7bb16c5b134efa38f07bb30db9412fc2ddee3def3a) | SUCCESS | Contract created on Studio Next |
| Create revision | [`0x00531aec…54e5`](https://explorer-studio.genlayer.com/tx/0x00531aec3a4e9d2d6920df79cd0a1d22d9e5e085e1687661382a904bd13854e5) | SUCCESS | `sunset-demo-api` revision 1 created |
| Register consumer beta | [`0x977494f9…1650`](https://explorer-studio.genlayer.com/tx/0x977494f92dbb57628d90e0b35573a31a7dc858f7da969e7fbf9d6fd2b0621650) | SUCCESS | Independent wallet/repository registered |
| Seal exact terms | [`0x60bd5a2a…4196`](https://explorer-studio.genlayer.com/tx/0x60bd5a2a2916e0dfc7371de661acc401ef50aef1308c70f6dd5850b0b3de4196) | SUCCESS | Terms digest `b65a…a0e2` fixed |
| Alpha consent | [`0x42aa240c…c58f`](https://explorer-studio.genlayer.com/tx/0x42aa240caa0031982727c63f54c73c932e2eb16622d434bf473555cd29a8c58f) | SUCCESS | Sender accepted exact terms |
| Alpha evidence | [`0x609294b8…612c`](https://explorer-studio.genlayer.com/tx/0x609294b8d015c401e202dd4398d10db8980f84efda583371df8d1268e31c612c) | SUCCESS | PatchProof commit-pinned report recorded |
| Alpha assessment | [`0xee4825b8…ed83`](https://explorer-studio.genlayer.com/tx/0xee4825b842214c38fa1afc6a966ab7a319594549dce767ee4dc0334d564aed83) | SUCCESS | Validator consensus returned READY |
| Early shutdown | [`0x22a9d98f…0976`](https://explorer-studio.genlayer.com/tx/0x22a9d98fb0f769ac291a0e66f37b0136bd05b18b2a2b94c5541ba69ae4b80976) | ERROR | Quorum bypass rejected |
| Beta consent | [`0xef522b61…c793`](https://explorer-studio.genlayer.com/tx/0xef522b618a573655b3f758505be0a0201b8b41db7c36f77b31bd71ac4a1dc793) | SUCCESS | Operator/consumer wallet accepted terms |
| Beta evidence | [`0xe93188b4…614a`](https://explorer-studio.genlayer.com/tx/0xe93188b418836cfc84f0e1d631c85c32e508b7cbccc4c814bb0c23dd2b3d614a) | SUCCESS | ClaimAnchor commit-pinned report recorded |
| Beta assessment | [`0xff931d09…9029`](https://explorer-studio.genlayer.com/tx/0xff931d094d7725f75daa7195e3a4c4185586588707ebcd218cd86d4351a39029) | SUCCESS | Validator consensus returned READY; 2/2 quorum |
| Execute shutdown | [`0xa8301d0a…d8d9`](https://explorer-studio.genlayer.com/tx/0xa8301d0ad81e908124a5025c74eabd26cc6127c1672741abdd63187fb155d8d9) | SUCCESS | Exact capability consumed once |
| Wrong actor | [`0xcfbecde0…7e03`](https://explorer-studio.genlayer.com/tx/0xcfbecde0aee6f2c0e260553ed6224238feb7edacd9b6237f518bc44d4b387e03) | ERROR | Non-operator execution rejected |
| Double consume | [`0x300a970e…34fb`](https://explorer-studio.genlayer.com/tx/0x300a970e2316e2ee2a618028746e8dbf8a99903200faeed4fefe2cd5160e34fb) | ERROR | Terminal capability replay rejected |

## Canonical final state

- Status: `CONSUMED`
- Required consumers: `2`
- Ready consumers: `2`
- Authorized: `true`
- Consumed: `true`
- Execution receipt: `ffa9c999bec29d0180569f3fb2093e1f44fc8f3b884cc59ebe30b3a228f50597`

## Pinned evidence

- [Consumer alpha evidence](https://raw.githubusercontent.com/eaglebooth/PatchProof/eb7f5b6f9d8df88c34c7263930b4b8f3f7595ea4/SUNSETQUORUM_CONSUMER_ALPHA.md)
- [Consumer beta evidence](https://raw.githubusercontent.com/eaglebooth/ClaimAnchor/51ff6680f8c2ee876d5cbaf382602be1af13ad82/SUNSETQUORUM_CONSUMER_BETA.md)

The Markdown files provide bounded facts only. Authority derives from registered senders, sealed on-chain terms, unanimous readiness, and the operator check.
