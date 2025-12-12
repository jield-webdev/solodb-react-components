import { User } from '../interfaces/user';
export declare const useAuth: () => {
    user: User | null;
    setUser: import('react').Dispatch<import('react').SetStateAction<User | null>>;
    isLoadingUser: boolean;
};
