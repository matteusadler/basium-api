import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private documentsService;
    constructor(documentsService: DocumentsService);
    findAll(user: any): Promise<any>;
    findOne(id: string, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
