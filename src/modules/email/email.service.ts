import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private resend: Resend
  private readonly logger = new Logger(EmailService.name)
  private readonly fromEmail = process.env.RESEND_FROM_EMAIL || 'convites@basium.com.br'

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  async sendInvite(params: {
    to: string
    name: string
    inviterName: string
    companyName: string
    role: string
    inviteLink: string
    expiresIn: string
  }) {
    const roleLabel = {
      CORRETOR: 'Corretor',
      GERENTE: 'Gerente',
      ADMIN: 'Administrador',
      GESTOR_TRAFEGO: 'Gestor de Tráfego',
    }[params.role] || params.role

    try {
      await this.resend.emails.send({
        from: `Basium CRM <${this.fromEmail}>`,
        to: params.to,
        subject: `Você foi convidado para ${params.companyName}`,
        html: `
        <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #111827; font-size: 24px; margin: 0;">Basium CRM</h1>
              </div>
              <h2 style="color: #111827; font-size: 20px;">Olá${params.name ? ', ' + params.name : ''}!</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
                <strong>${params.inviterName}</strong> convidou você para fazer parte da equipe 
                <strong>${params.companyName}</strong> como <strong>${roleLabel}</strong>.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${params.inviteLink}" 
                   style="background: #4f46e5; color: wte; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
                  Aceitar Convite
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                Este link expira em ${params.expiresIn}.<br/>
                Se você não esperava este convite, ignore este email.
              </p>
            </div>
          </body>
          </html>
        `,
      })
      this.logger.log(`Convite enviado para ${params.to}`)
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${params.to}:`, error)
      throw error
    }
  }
}
