// Utility functions for FHEVM operations

export const getEncryptionMethod = (internalType: string) => {
  if (internalType.includes("uint8")) return "encrypt8";
  if (internalType.includes("uint16")) return "encrypt16";
  if (internalType.includes("uint32")) return "encrypt32";
  if (internalType.includes("uint64")) return "encrypt64";
  if (internalType.includes("uint128")) return "encrypt128";
  if (internalType.includes("uint256")) return "encrypt256";
  if (internalType.includes("bool")) return "encrypt_bool";
  if (internalType.includes("string")) return "encrypt_string";
  throw new Error(`Unsupported type: ${internalType}`);
};

export const buildParamsFromAbi = (enc: any, abi: any[], functionName: string): any[] => {
  const functionAbi = abi.find(item => item.type === "function" && item.name === functionName);
  if (!functionAbi) {
    throw new Error(`Function ${functionName} not found in ABI`);
  }
  
  if (!functionAbi.inputs || functionAbi.inputs.length === 0) {
    return [];
  }
  
  const params: any[] = [];
  for (let i = 0; i < functionAbi.inputs.length; i++) {
    const input = functionAbi.inputs[i];
    if (input.internalType.includes("uint") || input.internalType.includes("bool")) {
      params.push(enc.encryptedData);
    } else if (input.internalType.includes("string")) {
      params.push(enc.encryptedData);
    } else {
      params.push(enc.encryptedData);
    }
  }
  
  return params;
};
