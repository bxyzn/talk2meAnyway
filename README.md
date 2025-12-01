# talk2meAnyway❤️‍🩹
### Where secrets stay secret

"no1 knows" is a zero-knowledge messaging platform that ensures your conversations remain exactly that - known to no one but the intended recipients. Built on robust end-to-end encryption (E2EE), it demonstrates how modern web applications can provide absolute privacy through client-side cryptography and zero-trust server architecture.

What happens in no1 knows, stays in no1 knows - because even we can't peek inside your messages. 🔒✨

---

## Table of contents

- High-level overview
- Key features
- Quick start (run locally)
- How it works (low-level / data flow)
- Security model & considerations

# talk2meAnyway — Zero-knowledge messaging demo 🤫🔒

"talk2meAnyway" is a compact educational demo that shows how a web app can keep messages private by performing all cryptography in the browser while the server stays deliberately blind (it only relays or stores ciphertext).

This README focuses on this repository: how to run it, what it does, and the security trade-offs.

## Quick summary

- E2EE is performed entirely client-side (in the browser).
- The server relays/stores ciphertext only and does not hold private keys or plaintext.
- The codebase is intentionally small for auditability and learning.

## Features

- Client-side key generation and local key storage
- Symmetric session keys derived from asymmetric key exchange
- Minimal Flask + Socket.IO relay server that never decrypts messages
- Lightweight UI (no frameworks) for straightforward inspection

## Quick start (run locally)

Requirements: Python 3.8+, pip

1. Create and activate a virtual environment (zsh):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the server:

```bash
python server.py
```

4. Visit http://localhost:5000/ in your browser.

## How it works (brief)

- Clients generate or import asymmetric key pairs in the browser.
- When sending a message, the client derives or uses a symmetric session key to encrypt the payload (AES-GCM or equivalent).
- The client sends ciphertext + minimal metadata to the server; the server stores/transmits ciphertext only.
- Recipients fetch ciphertext and decrypt it locally in their browser.

The server is a transport/relay and should be auditable to confirm it never performs decryption.

## Security notes & considerations

This project is educational. Important considerations before any real use:

- Storing private keys in `localStorage` is convenient but susceptible to XSS; prefer IndexedDB + strong CSP in production.
- Use the Web Crypto API primitives — avoid rolling your own crypto.
- Add key authentication (out-of-band verification or key-transparency mechanisms) to prevent active MITM when the server distributes public keys.
- Include timestamps/nonces and replay protection in metadata.

## Project layout

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

## Development notes

- The UI is intentionally minimal to make the cryptographic boundaries clear.
- If you change crypto primitives, update and test all code paths that derive or parse keys.
- For large histories consider server-side chunking and streaming to avoid UI freezes.

## Contributing

PRs and suggestions welcome. Useful improvements:

- Better key storage (IndexedDB + secure backup/restore)
- Chunked history streaming and a progress indicator
- Tests for encryption/decryption round trips

When proposing crypto-related changes, include a security rationale and test demonstrating correctness.

## License

See the `LICENSE` file in the repository.

---

Thank you for trying "talk2meAnyway" — because the best secrets are the ones that stay secret. 🤫
- Consider per-message nonces and ephemeral keys to increase forward secrecy.
