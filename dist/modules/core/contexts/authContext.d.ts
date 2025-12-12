import { User } from '../interfaces/user';
interface AuthContext {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoadingUser: boolean;
}
export declare const AuthContext: import('react').Context<AuthContext>;
export {};
