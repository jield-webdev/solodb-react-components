import { User } from '../../../../../solodb-typescript-core/src/index.ts';
export declare const useAuth: () => {
    user: User | null;
    setUser: import('react').Dispatch<import('react').SetStateAction<User | null>>;
    isLoadingUser: boolean;
};
