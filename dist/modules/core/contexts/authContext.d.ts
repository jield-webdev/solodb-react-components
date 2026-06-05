import { User } from '@jield/solodb-typescript-core';
interface AuthContext {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoadingUser: boolean;
}
export declare const AuthContext: import('react').Context<AuthContext>;
export {};
