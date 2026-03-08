import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../../../common/prisma/prisma.service'

export const PLAN_FEATURE_KEY = 'plan_feature'
export const PlanFeature = (feature: string) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(PLAN_FEATURE_KEY, feature, descriptor?.value ?? target)
    return descriptor
  }
}

export const PLAN_LIMIT_KEY = 'plan_limit'
export const PlanLimit = (resource: string) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(PLAN_LIMIT_KEY, resource, descriptor?.value ?? target)
    return descriptor
  }
}

@Injectable()
export class PlanGuard implements CanActivate {
  private readonly logger = new Logger(PlanGuard.name)

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user?.companyId) {
      throw new ForbiddenException('Usuário não autenticado')
    }

    // Get required feature from decorator
    const requiredFeature = this.reflector.get<string>(
      PLAN_FEATURE_KEY,
      context.getHandler(),
    )

    // Get required resource limit from decorator
    const requiredLimit = this.reflector.get<string>(
      PLAN_LIMIT_KEY,
      context.getHandler(),
    )

    if (!requiredFeature && !requiredLimit) {
      return true // No plan restriction
    }

    // Get company with plan
    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
      include: { usage: true },
    })

    if (!company) {
      throw new ForbiddenException('Empresa não encontrada')
    }

    // Check plan status
    if (company.planStatus === 'CANCELLED') {
      throw new ForbiddenException('Assinatura cancelada. Por favor, renove seu plano.')
    }

    if (company.planStatus === 'OVERDUE') {
      throw new ForbiddenException('Pagamento pendente. Por favor, regularize sua assinatura.')
    }

    // Get plan
    const plan = await this.prisma.plan.findUnique({
      where: { id: company.planId },
    })

    if (!plan) {
      throw new ForbiddenException('Plano não encontrado')
    }

    // Check feature access
    if (requiredFeature) {
      const hasFeature = this.checkFeature(plan, requiredFeature)
      if (!hasFeature) {
        throw new ForbiddenException(
          `Recurso "${requiredFeature}" não disponível no seu plano. Faça upgrade para acessar.`
        )
      }
    }

    // Check resource limits
    if (requiredLimit && company.usage) {
      const limitExceeded = this.checkLimit(plan, company.usage, requiredLimit)
      if (limitExceeded) {
        throw new ForbiddenException(
          `Limite de "${requiredLimit}" atingido no seu plano. Faça upgrade para continuar.`
        )
      }
    }

    return true
  }

  private checkFeature(plan: any, feature: string): boolean {
    switch (feature) {
      case 'ai':
        return plan.hasAi
      case 'copilot':
        return plan.hasCopilot
      case 'flow_builder':
        return plan.hasFlowBuilder
      case 'portals':
        return plan.hasPortals
      default:
        this.logger.warn(`Unknown feature: ${feature}`)
        return true
    }
  }

  private checkLimit(plan: any, usage: any, resource: string): boolean {
    switch (resource) {
      case 'leads':
        return usage.leadsCount >= plan.maxLeads
      case 'users':
        return usage.usersCount >= plan.maxUsers
      case 'whatsapp_numbers':
        return false // Would need to count actual numbers
      case 'pipelines':
        return false // Would need to count pipelines
      case 'flows':
        return usage.activeFlows >= plan.maxFlows
      case 'flow_executions':
        return usage.flowExecMonth >= plan.maxFlowExecutions
      case 'storage':
        const storageGb = Number(usage.storageBytes) / (1024 * 1024 * 1024)
        return storageGb >= plan.storageGb
      default:
        this.logger.warn(`Unknown resource limit: ${resource}`)
        return false
    }
  }
}
