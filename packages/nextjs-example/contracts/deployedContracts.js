"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deployedContracts = {
    31337: {
        FHECounter: {
            address: "0x40e8Aa088739445BC3a3727A724F56508899f65B",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "decrement",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getCount",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "increment",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 3,
        },
    },
    11155111: {
        FHECounter: {
            address: "0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e",
            abi: [
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "decrement",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getCount",
                    outputs: [
                        {
                            internalType: "euint32",
                            name: "",
                            type: "bytes32",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "externalEuint32",
                            name: "inputEuint32",
                            type: "bytes32",
                        },
                        {
                            internalType: "bytes",
                            name: "inputProof",
                            type: "bytes",
                        },
                    ],
                    name: "increment",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "protocolId",
                    outputs: [
                        {
                            internalType: "uint256",
                            name: "",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "pure",
                    type: "function",
                },
            ],
            inheritedFunctions: {},
            deployedOnBlock: 9368216,
        },
    },
};
exports.default = deployedContracts;
