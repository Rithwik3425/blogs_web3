/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blogs_web3.json`.
 */
export type BlogsWeb3 = {
  "address": "JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H",
  "metadata": {
    "name": "blogsWeb3",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deleteBlog",
      "discriminator": [
        110,
        242,
        46,
        158,
        112,
        4,
        189,
        122
      ],
      "accounts": [
        {
          "name": "blogState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "blogId"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "blogId",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeBlog",
      "discriminator": [
        195,
        223,
        187,
        134,
        244,
        232,
        54,
        32
      ],
      "accounts": [
        {
          "name": "blogState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "blogId"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "blogId",
          "type": "string"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "name": "sha256Hash",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateBlog",
      "discriminator": [
        252,
        54,
        5,
        181,
        182,
        6,
        112,
        203
      ],
      "accounts": [
        {
          "name": "blogState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "blogId"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "blogId",
          "type": "string"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "name": "sha256Hash",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "blogState",
      "discriminator": [
        244,
        86,
        195,
        29,
        196,
        144,
        214,
        46
      ]
    }
  ],
  "types": [
    {
      "name": "blogState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "name": "sha256Hash",
            "type": "string"
          }
        ]
      }
    }
  ]
};
