# 📝 blogs_web3 - A Decentralized Blog dApp on Solana

`blogs_web3` is a Solana program built using the Anchor framework that allows users to create, update, and delete blogs with metadata stored on-chain. IPFS and SHA256 hashes are used for decentralized and verifiable content storage.

---

## 🚀 Features

- Create a blog with:
  - Title
  - IPFS content hash
  - SHA256 hash for verification

- Update existing blogs
- Delete blogs
- Deterministic blog account addresses using seeds
- Full test coverage with `jest` and `ts-mocha`
- Built and deployed to Solana **Devnet**

---

## 📁 Project Structure

```
blogs_web3/
├── anchor/
│   ├── Anchor.toml           # Anchor config
│   ├── programs/
│   │   └── blogs_web3/       # Rust smart contract
│   │       └── src/lib.rs
│   ├── tests/
│   │   └── blogs_web3.test.ts # Integration tests
│   └── target/               # Build output
└── node_modules/
    └── package.json
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js >= 18.x
- Yarn
- Rust & Cargo
- Solana CLI
- Anchor CLI

Install dependencies:

```bash
yarn install
anchor build
```

---

### 2. Configuration

Update the `Anchor.toml`:

```toml
[provider]
cluster = "devnet"
wallet = "~/.config/solana/phantom-keypair.json"

[programs.devnet]
blogs_web3 = "E8V4HbroMG48f6oPBX5vGAsLhim4T2NrYJkw8ySe7xD2"
```

To check your keypair and cluster:

```bash
solana config get
```

---

### 3. Build the Program

```bash
anchor build
```

This compiles the Rust code and outputs the `.so` binary in `target/deploy`.

---

### 4. Run Tests

```bash
anchor test
```

This runs all integration tests in `tests/blogs_web3.test.ts`.

---

### 5. Deploy to Devnet

```bash
anchor deploy
```

You'll see a success message like:

```
Program Id: E8V4HbroMG48f6oPBX5vGAsLhim4T2NrYJkw8ySe7xD2
```

---

## 🧪 Test Coverage

Tests included:

- ✅ Create a blog
- ✅ Fetch and verify blog content
- ✅ Update blog title/IPFS/SHA256
- ✅ Delete a blog

To run test suite manually:

```bash
yarn test
```

---

## 🧠 Technical Highlights

- Deterministic blog PDA:

  ```rust
  seeds = [blog_id.as_bytes(), owner.key().as_ref()],
  ```

- Account reallocation for blog updates:

  ```rust
  realloc = BlogState::INIT_SPACE + 8, // 8 = Anchor discriminator
  ```

---

## 🔗 Built With

- [Solana](https://solana.com/)
- [Anchor](https://book.anchor-lang.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/) for tests

---

## 🛠 Future Work

- 🌐 Frontend using Next.js + Phantom wallet
- 📄 IPFS integration for blog content upload
- 🔍 Search/filter blogs
- 📟 Pagination for blog history

---

## 👨‍💻 Author

Made with ❤️ by [`rubix`](https://github.com/Rithwik3425)

---

## 📜 License

MIT License
