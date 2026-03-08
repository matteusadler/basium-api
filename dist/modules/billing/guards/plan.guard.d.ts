import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../common/prisma/prisma.service';
export declare const PLAN_FEATURE_KEY = "plan_feature";
export declare const PlanFeature: (feature: string) => (target: any, key?: string, descriptor?: any) => any;
export declare const PLAN_LIMIT_KEY = "plan_limit";
export declare const PlanLimit: (resource: string) => (target: any, key?: string, descriptor?: any) => any;
export declare class PlanGuard implements CanActivate {
    private reflector;
    private prisma;
    private readonly logger;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkFeature;
    private checkLimit;
}
