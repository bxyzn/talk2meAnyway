# no1 knows 🤫
### Where secrets stay secret

[Try it live](https://walle-hmj0.onrender.com/)  

"no1 knows" is a zero-knowledge messaging platform that ensures your conversations remain exactly that - known to no one but the intended recipients. Built on robust end-to-end encryption (E2EE), it demonstrates how modern web applications can provide absolute privacy through client-side cryptography and zero-trust server architecture.

What happens in no1 knows, stays in no1 knows - because even we can't peek inside your messages. 🔒✨

---

## Table of contents

- High-level overview
- Key features
- Live trial
- Quick start (run locally)
- How it works (low-level / data flow)
- Security model & considerations
- Project structure
- Development notes
- Contributing
- License

---

## High-level overview

"no1 knows" demonstrates the art of perfect secrecy by performing all cryptographic operations in your browser. The server is deliberately "blind" - acting only as a message relay that never sees your private keys or unencrypted messages. This makes it an ideal reference for privacy-first communication systems.

Goals:

- Demonstrate zero-knowledge architecture in practice
- Keep the server verifiably "blind" and auditable
- Show how true privacy can be both simple and secure

## Key features

- Client-side key generation and management
- Asymmetric key exchange for session keys
- Symmetric encryption for message payloads
- Minimal Python server that relays and stores ciphertext only
- Lightweight static client UI (no frameworks required)

## Live trial

Try the live demo: https://walle-hmj0.onrender.com/

Note: the demo is meant for evaluation and learning only. Do not use it for real secrets without reviewing and adapting the security model to your needs.

## Quick start (run locally)

Requirements: Python 3.8+, pip

1) Create and activate a virtual environment (zsh):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2) Install dependencies:

```bash
pip install -r requirements.txt
```

3) Start the server:

```bash
python server.py
```

4) Open your browser at http://localhost:5000/ (or the URL printed by the server).

The client UI is served from `templates/index.html` and static assets in `static/`.

## How it works — low-level (data flow)

This section explains the implementation details and message lifecycle. The purpose is to make the example easy to audit and extend.

Components:

- `server.py` — minimal Python web server (HTTP + message relay). Does not hold plaintext.
- `templates/index.html` — single-page app shell.
- `static/main.js` — UI glue code: key handling, message send/receive, DOM.
- `static/cryptoUtils.js` — cryptographic helpers (key gen, encrypt/decrypt, sign/verify).

End-to-end flow (step-by-step):

1. Key generation and onboarding

	- On first load, the browser generates an asymmetric keypair (eg. ECDH / ECDSA or RSA depending on implementation in `cryptoUtils.js`).
	- The private key never leaves the browser storage (IndexedDB or localStorage — review persistence in `main.js`).
	- The public key is uploaded to the server to let other clients look it up when initiating conversations.

2. Establishing a session (peer-to-peer key agreement)

	- When Alice wants to message Bob, she fetches Bob’s public key from the server.
	- Alice derives a shared symmetric session key using ECDH (Alice_priv, Bob_pub).
	- Optionally, Alice includes a one-time ephemeral key to provide forward secrecy.

3. Message encryption + send

	- Alice encrypts the message payload with the symmetric session key (AES-GCM or similar).
	- She may also sign the payload with her private signing key so Bob can verify authenticity.
	- Alice POSTs the ciphertext and any metadata (recipient id, sender pubkey id, nonce) to `server.py`.

4. Server relay

	- The server stores/transmits the ciphertext as-is. It does not possess private keys and cannot decrypt messages.
	- The server may persist cipherblobs for offline delivery; storage is optional and acts as a relay.

5. Message receive + decrypt

	- Bob fetches pending messages from the server.
	- Bob uses his private key to derive the same symmetric key (or unwrap the symmetric key) and decrypts the ciphertext in the browser.
	- Bob verifies the signature (if present) to ensure message authenticity.

Design notes:

- Keep key material in browser-controlled storage and minimize server-side sensitive state.
- Use authenticated encryption (AEAD) like AES-GCM to prevent tampering.
- Consider per-message nonces and ephemeral keys to increase forward secrecy.

## Security model & considerations

"no1 knows" is an educational implementation of zero-knowledge messaging — while it demonstrates security best practices, you should audit and adapt the code before using in production.

Threat model (what no1 knows assumes):

- The server is untrusted and may be fully compromised (it only stores/transmits ciphertext).
- Endpoints (user browsers) are trusted to store private keys securely.

Limitations and warnings:

- Local storage risks: storing private keys in localStorage is insecure in some threat models (XSS). Prefer IndexedDB with strong CSP and secure hosting.
- No centralized key-validation: consider adding a PKI or out-of-band verification for public keys to prevent MITM when the server is a key distribution point.
- Replay protection: include timestamps and nonces in metadata.
- The demo uses simplified cryptographic choices for readability — replace with reviewed libraries for production.

Best practice suggestions for production:

- Protect against XSS: use strict CSP, sanitize input, and avoid eval.
- Use Web Crypto API primitives; avoid rolling custom crypto.
- Introduce secure key backup and recovery if users expect cross-device access.
- Consider immutable audit logs or key transparency for public key distribution.

## Project structure

```
.
├─ server.py            # Minimal Python server / relay
├─ requirements.txt     # Python dependencies
├─ templates/
│  └─ index.html        # SPA shell
└─ static/
	├─ main.js           # UI and client orchestration
	└─ cryptoUtils.js    # Crypto helpers (keygen/encrypt/decrypt)
```

Open these files to inspect the crypto flow and data handling. `cryptoUtils.js` contains the local cryptography and is the most security-sensitive piece.

## Development notes

- The UI is deliberately minimal and framework-free to keep auditing straightforward.
- If you change cryptography primitives, update all code paths that derive or parse keys.
- When adding features (typing indicators, presence), keep the server blind to plaintext.

Quick lint/test checklist:

- Run the app locally and check the browser console for cryptographic errors.
- Use two different browsers or incognito windows to simulate separate users and confirm messages decrypt properly.

## Contributing

Contributions are welcome. Suggested ways to help:

- Improve the UI and UX while keeping the cryptographic boundaries clear.
- Add tests that cover encryption/decryption and key agreement flows.
- Add integration scripts or Dockerfile for reproducible deployments.

When opening pull requests, include a short security rationale for any crypto-related change and ideally a test demonstrating the change.

## Deployment

The live trial is hosted at: https://walle-hmj0.onrender.com/

For production: deploy the server behind HTTPS with secure headers (HSTS, CSP) and monitor server logs for unusual activity. Keep the server code minimal — the crypto responsibilities remain client-side.

## License

See the `LICENSE` file in this repository.

## Contact / Questions

If you have questions or want help extending Walle, open an issue or contact the repository owner.

---

Thank you for trying no1 knows — because the best secrets are the ones that stay secret. 🤫
