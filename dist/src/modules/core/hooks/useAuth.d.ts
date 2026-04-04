import { User } from '@jield/solodb-typescript-core';
export declare const useAuth: () => {
    user: User | null;
    setUser: import('react').Dispatch<import('react').SetStateAction<User | null>>;
    isLoadingUser: boolean;
};
