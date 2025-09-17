export interface ResponseInterface {
    id: number;
    question: string;
    response: string;
    tags: string[];
    favorited: boolean;
    
    createdAt: string;
    updatedAt: string;
}