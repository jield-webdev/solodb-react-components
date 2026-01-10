import { User } from '../../../../../solodb-typescript-core/src/index.ts';
interface AuthContext {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoadingUser: boolean;
}
export declare const AuthContext: import('react').Context<AuthContext>;
export {};
