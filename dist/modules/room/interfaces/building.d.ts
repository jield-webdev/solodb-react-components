import { Site } from './site';
export interface Building {
    id: number;
    name: string;
    code: string;
    site: Site;
    amount: {
        rooms: number;
    };
}
