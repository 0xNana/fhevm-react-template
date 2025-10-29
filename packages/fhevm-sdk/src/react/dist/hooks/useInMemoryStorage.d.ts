import { ReactNode } from "react";
import { GenericStringStorage } from "@fhevm/core";
interface UseInMemoryStorageState {
    storage: GenericStringStorage;
}
interface InMemoryStorageProviderProps {
    children: ReactNode;
}
export declare const useInMemoryStorage: () => UseInMemoryStorageState;
export declare const InMemoryStorageProvider: React.FC<InMemoryStorageProviderProps>;
export {};
//# sourceMappingURL=useInMemoryStorage.d.ts.map