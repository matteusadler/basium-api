import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: any;
        userId: any;
        email: any;
        companyId: any;
        role: any;
    }>;
}
export {};
