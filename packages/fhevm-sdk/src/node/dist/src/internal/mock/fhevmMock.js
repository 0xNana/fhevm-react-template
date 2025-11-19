//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////
import { JsonRpcProvider } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
export const fhevmMockCreateInstance = async (parameters) => {
    const provider = new JsonRpcProvider(parameters.rpcUrl);
    const instance = await MockFhevmInstance.create(provider, provider, {
        //aclContractAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
        aclContractAddress: parameters.metadata.ACLAddress,
        chainId: parameters.chainId,
        gatewayChainId: 55815,
        // inputVerifierContractAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
        // kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
        inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
        kmsContractAddress: parameters.metadata.KMSVerifierAddress,
        verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
        verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    });
    // Type assertion: MockFhevmInstance is compatible with FhevmInstance at runtime
    // The mock supports additional bit sizes (1, 512, 1024, 2048) but won't use them
    // in practice, making this safe for development/testing scenarios
    // Cast through 'unknown' first to satisfy TypeScript's strict type checking
    return instance;
};
//# sourceMappingURL=fhevmMock.js.map