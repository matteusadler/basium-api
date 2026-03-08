// Basium CRM - Seed Script
// Popula o banco de dados com dados demo para teste

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do Basium CRM...')

  // 1. Create Plan
  let plan = await prisma.plan.findFirst({ where: { name: 'Professional' } })
  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        name: 'Professional',
        stripePriceIdMonthly: 'price_monthly_professional',
        stripePriceIdYearly: 'price_yearly_professional',
        maxLeads: 5000,
        maxUsers: 10,
        maxWhatsappNumbers: 3,
        maxPipelines: 5,
        maxFlows: 20,
        maxFlowExecutions: 10000,
        storageGb: 10,
        hasAi: true,
        hasCopilot: true,
        hasFlowBuilder: true,
        hasPortals: true,
        trialDays: 14,
      },
    })
  }
  console.log('✅ Plano criado:', plan.name)

  // 2. Create Company
  let company = await prisma.company.findFirst({ where: { name: 'Imobiliária Demo' } })
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Imobiliária Demo',
        cnpj: '12.345.678/0001-90',
        planId: plan.id,
        planStatus: 'ACTIVE',
      },
    })
  }
  console.log('✅ Empresa criada:', company.name)

  // 3. Create Users
  const passwordHash = await bcrypt.hash('demo123', 10)
  
  let adminUser = await prisma.user.findFirst({ where: { email: 'admin@demo.basium.com.br' } })
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        email: 'admin@demo.basium.com.br',
        name: 'Admin Demo',
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    })
  }
  console.log('✅ Usuário admin criado:', adminUser.email)

  let brokerUser = await prisma.user.findFirst({ where: { email: 'corretor@demo.basium.com.br' } })
  if (!brokerUser) {
    brokerUser = await prisma.user.create({
      data: {
        companyId: company.id,
        email: 'corretor@demo.basium.com.br',
        name: 'João Silva',
        passwordHash,
        role: 'CORRETOR',
        isActive: true,
        emailVerified: true,
      },
    })
  }
  console.log('✅ Usuário corretor criado:', brokerUser.email)

  // 4. Create Pipeline with Stages
  let pipeline = await prisma.pipeline.findFirst({ where: { companyId: company.id, name: 'Vendas' } })
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        companyId: company.id,
        name: 'Vendas',
        type: 'SALE',
        isDefault: true,
        isActive: true,
      },
    })
  }
  console.log('✅ Pipeline criado:', pipeline.name)

  // Create Stages
  const stages = [
    { name: 'Novo Lead', color: '#6366f1', order: 1, probability: 10, type: 'NEW' },
    { name: 'Qualificação', color: '#8b5cf6', order: 2, probability: 20, type: 'QUALIFY' },
    { name: 'Visita Agendada', color: '#3b82f6', order: 3, probability: 40, type: 'VISIT' },
    { name: 'Proposta', color: '#f59e0b', order: 4, probability: 60, type: 'PROPOSAL' },
    { name: 'Negociação', color: '#ef4444', order: 5, probability: 80, type: 'NEGOTIATION' },
    { name: 'Ganho', color: '#10b981', order: 6, probability: 100, type: 'WON' },
    { name: 'Perdido', color: '#6b7280', order: 7, probability: 0, type: 'LOST' },
  ]

  // Check if stages already exist
  const existingStages = await prisma.stage.findMany({ where: { pipelineId: pipeline.id } })
  const createdStages: any[] = existingStages.length > 0 ? existingStages : []
  
  if (existingStages.length === 0) {
    for (const stage of stages) {
      const created = await prisma.stage.create({
        data: {
          pipelineId: pipeline.id,
          ...stage,
        },
      })
      createdStages.push(created)
    }
  }
  console.log('✅ Estágios criados:', createdStages.length)

  // Check existing data
  const existingOwners = await prisma.owner.findMany({ where: { companyId: company.id } })
  const existingProperties = await prisma.property.findMany({ where: { companyId: company.id } })
  const existingLeads = await prisma.lead.findMany({ where: { companyId: company.id } })

  if (existingOwners.length > 0 && existingProperties.length > 0 && existingLeads.length > 0) {
    console.log('✅ Dados já existem, pulando criação de owners, properties e leads')
    console.log('')
    console.log('🎉 Seed concluído com sucesso!')
    return
  }

  // 5. Create Owners
  const owners = [
    {
      companyId: company.id,
      name: 'Carlos Eduardo Santos',
      cpfCnpj: '123.456.789-00',
      phone: '(11) 99999-1111',
      email: 'carlos.santos@email.com',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      bankName: 'Itaú',
      bankAgency: '1234',
      bankAccount: '12345-6',
      accountType: 'CORRENTE',
      pixKey: 'carlos.santos@email.com',
      pixKeyType: 'EMAIL',
    },
    {
      companyId: company.id,
      name: 'Maria Fernanda Lima',
      cpfCnpj: '987.654.321-00',
      phone: '(11) 99999-2222',
      email: 'maria.lima@email.com',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      bankName: 'Bradesco',
      bankAgency: '5678',
      bankAccount: '67890-1',
      accountType: 'CORRENTE',
      pixKey: '98765432100',
      pixKeyType: 'CPF',
    },
  ]

  const createdOwners: any[] = []
  for (const owner of owners) {
    const created = await prisma.owner.create({ data: owner })
    createdOwners.push(created)
  }
  console.log('✅ Proprietários criados:', createdOwners.length)

  // 6. Create Properties
  const properties = [
    {
      companyId: company.id,
      code: 'IMV0001',
      type: 'APARTAMENTO',
      purpose: 'VENDA',
      status: 'AVAILABLE',
      street: 'Rua Oscar Freire',
      number: '500',
      complement: 'Apto 152',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-001',
      totalArea: 120,
      builtArea: 100,
      privateArea: 95,
      bedrooms: 3,
      suites: 1,
      bathrooms: 2,
      parkingSpots: 2,
      floor: 15,
      features: ['Varanda', 'Ar condicionado', 'Academia', 'Piscina', 'Churrasqueira'],
      salePrice: 1500000,
      iptuYearly: 4500,
      condoMonthly: 1800,
      description: 'Excelente apartamento no coração dos Jardins, com vista panorâmica.',
      publishOnPortals: true,
    },
    {
      companyId: company.id,
      code: 'IMV0002',
      type: 'CASA',
      purpose: 'VENDA',
      status: 'AVAILABLE',
      street: 'Alameda Santos',
      number: '1200',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01418-100',
      totalArea: 350,
      builtArea: 280,
      privateArea: 250,
      bedrooms: 4,
      suites: 2,
      bathrooms: 4,
      parkingSpots: 4,
      features: ['Piscina', 'Jardim', 'Churrasqueira', 'Home office', 'Lareira'],
      salePrice: 3500000,
      iptuYearly: 12000,
      description: 'Casa de alto padrão em localização privilegiada.',
      publishOnPortals: true,
    },
    {
      companyId: company.id,
      code: 'IMV0003',
      type: 'APARTAMENTO',
      purpose: 'LOCACAO',
      status: 'AVAILABLE',
      street: 'Av. Brigadeiro Faria Lima',
      number: '2000',
      complement: 'Apto 81',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01452-001',
      totalArea: 85,
      builtArea: 75,
      privateArea: 70,
      bedrooms: 2,
      suites: 1,
      bathrooms: 2,
      parkingSpots: 1,
      floor: 8,
      features: ['Varanda gourmet', 'Ar condicionado', 'Academia'],
      rentPrice: 5500,
      condoMonthly: 950,
      description: 'Apartamento moderno próximo ao metrô.',
      publishOnPortals: true,
    },
    {
      companyId: company.id,
      code: 'IMV0004',
      type: 'SALA_COMERCIAL',
      purpose: 'LOCACAO',
      status: 'AVAILABLE',
      street: 'Av. Paulista',
      number: '1500',
      complement: 'Sala 1201',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      totalArea: 60,
      builtArea: 60,
      parkingSpots: 2,
      floor: 12,
      features: ['Recepção', 'Copa', 'Ar condicionado central'],
      rentPrice: 4000,
      condoMonthly: 800,
      description: 'Sala comercial na Paulista com vista para a avenida.',
      publishOnPortals: true,
    },
  ]

  const createdProperties: any[] = []
  for (const property of properties) {
    const created = await prisma.property.create({ data: property })
    createdProperties.push(created)
  }
  console.log('✅ Imóveis criados:', createdProperties.length)

  // Link owners to properties
  await prisma.propertyOwner.create({
    data: {
      propertyId: createdProperties[0].id,
      ownerId: createdOwners[0].id,
      ownershipPct: 100,
    },
  })
  await prisma.propertyOwner.create({
    data: {
      propertyId: createdProperties[1].id,
      ownerId: createdOwners[1].id,
      ownershipPct: 100,
    },
  })
  await prisma.propertyOwner.create({
    data: {
      propertyId: createdProperties[2].id,
      ownerId: createdOwners[0].id,
      ownershipPct: 50,
    },
  })
  await prisma.propertyOwner.create({
    data: {
      propertyId: createdProperties[2].id,
      ownerId: createdOwners[1].id,
      ownershipPct: 50,
    },
  })
  console.log('✅ Proprietários vinculados aos imóveis')

  // 7. Create Leads
  const leadNames = [
    'Ana Paula Rodrigues',
    'Roberto Carlos Mendes',
    'Fernanda Oliveira',
    'Lucas Santos',
    'Juliana Costa',
    'Pedro Henrique',
    'Camila Ferreira',
    'Bruno Almeida',
    'Mariana Silva',
    'Thiago Nascimento',
    'Isabela Martins',
    'Rafael Souza',
  ]

  const origins = ['SITE', 'WHATSAPP', 'INDICACAO', 'PORTAL_ZAP', 'PORTAL_VIVAREAL', 'TELEFONE']
  const temperatures = ['HOT', 'WARM', 'COLD']
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

  const createdLeads: any[] = []
  for (let i = 0; i < leadNames.length; i++) {
    const stageIndex = Math.min(i % 5, 4) // Distribute across first 5 stages
    const lead = await prisma.lead.create({
      data: {
        companyId: company.id,
        userId: i % 2 === 0 ? adminUser.id : brokerUser.id,
        pipelineId: pipeline.id,
        stageId: createdStages[stageIndex].id,
        name: leadNames[i],
        phone: `(11) 9${String(9000 + i).padStart(4, '0')}-${String(1000 + i).padStart(4, '0')}`,
        email: `${leadNames[i].toLowerCase().replace(' ', '.').replace(/[^a-z.]/g, '')}@email.com`,
        origin: origins[i % origins.length],
        temperature: temperatures[i % temperatures.length] as any,
        priority: priorities[i % priorities.length] as any,
        propertyTypes: ['APARTAMENTO', 'CASA'],
        neighborhoods: ['Jardins', 'Pinheiros', 'Moema'],
        minValue: 500000 + (i * 100000),
        maxValue: 1500000 + (i * 200000),
        bedrooms: 2 + (i % 3),
        estimatedValue: 800000 + (i * 150000),
        tags: ['interessado', i % 2 === 0 ? 'comprador' : 'investidor'],
      },
    })
    createdLeads.push(lead)
  }
  console.log('✅ Leads criados:', createdLeads.length)

  // 8. Create Tasks
  const taskTypes = ['CALL', 'WHATSAPP', 'VISIT', 'MEETING', 'PROPOSAL']
  const today = new Date()
  
  for (let i = 0; i < 20; i++) {
    const dueDate = new Date(today)
    dueDate.setDate(today.getDate() + (i % 7) - 2) // Some overdue, some today, some future
    
    await prisma.task.create({
      data: {
        companyId: company.id,
        leadId: createdLeads[i % createdLeads.length].id,
        userId: i % 2 === 0 ? adminUser.id : brokerUser.id,
        title: `${taskTypes[i % taskTypes.length] === 'CALL' ? 'Ligar para' : 
                taskTypes[i % taskTypes.length] === 'VISIT' ? 'Visita com' :
                taskTypes[i % taskTypes.length] === 'MEETING' ? 'Reunião com' :
                taskTypes[i % taskTypes.length] === 'PROPOSAL' ? 'Enviar proposta para' :
                'Contatar'} ${createdLeads[i % createdLeads.length].name}`,
        description: `Tarefa de acompanhamento para lead ${createdLeads[i % createdLeads.length].name}`,
        type: taskTypes[i % taskTypes.length] as any,
        priority: priorities[i % priorities.length] as any,
        status: i < 5 ? 'DONE' : 'PENDING',
        dueDate,
        dueTime: `${9 + (i % 9)}:00`,
      },
    })
  }
  console.log('✅ Tarefas criadas: 20')

  // 9. Create Notes for some leads
  for (let i = 0; i < 5; i++) {
    await prisma.note.create({
      data: {
        leadId: createdLeads[i].id,
        userId: adminUser.id,
        content: `Cliente demonstrou interesse em imóveis na região dos Jardins. Orçamento aproximado de R$ ${(1000000 + i * 200000).toLocaleString('pt-BR')}.`,
        isPinned: i === 0,
      },
    })
  }
  console.log('✅ Notas criadas: 5')

  // 10. Create Lead History
  for (let i = 0; i < 10; i++) {
    await prisma.leadHistory.create({
      data: {
        leadId: createdLeads[i].id,
        userId: adminUser.id,
        event: i % 2 === 0 ? 'STAGE_CHANGED' : 'NOTE_ADDED',
        metadata: { from: 'Novo Lead', to: 'Qualificação' },
      },
    })
  }
  console.log('✅ Histórico de leads criado: 10')

  // 11. Create a sample Contract
  const contract = await prisma.contract.create({
    data: {
      companyId: company.id,
      type: 'RENTAL',
      status: 'ACTIVE',
      propertyId: createdProperties[2].id,
      leadId: createdLeads[0].id,
      brokerId: adminUser.id,
      rentAmount: 5500,
      startDate: new Date(),
      durationMonths: 30,
      dueDayOfMonth: 10,
      adjustmentIndex: 'IGPM',
      adjustmentFrequency: 12,
      guaranteeType: 'FIADOR',
      penaltyPct: 10,
    },
  })
  console.log('✅ Contrato criado')

  // Update property status
  await prisma.property.update({
    where: { id: createdProperties[2].id },
    data: { status: 'RENTED' },
  })

  // Mark lead as won
  await prisma.lead.update({
    where: { id: createdLeads[0].id },
    data: {
      status: 'WON',
      stageId: createdStages[5].id, // Ganho stage
      closedValue: 5500 * 30,
      closedAt: new Date(),
    },
  })

  // 12. Create Financial Entries for the contract
  const startDate = new Date()
  for (let i = 0; i < 6; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(startDate.getMonth() + i)
    dueDate.setDate(10)

    await prisma.financialEntry.create({
      data: {
        companyId: company.id,
        contractId: contract.id,
        type: 'INCOME',
        category: 'RENT',
        description: `Aluguel ${i + 1}/30 - ${createdProperties[2].code}`,
        amount: 5500,
        dueDate,
        status: i < 2 ? 'PAID' : 'PENDING',
        paidAt: i < 2 ? new Date() : null,
        paymentMethod: i < 2 ? 'PIX' : null,
      },
    })
  }
  console.log('✅ Lançamentos financeiros criados: 6')

  // 13. Create Commission
  await prisma.commission.create({
    data: {
      companyId: company.id,
      contractId: contract.id,
      recipientId: adminUser.id,
      recipientType: 'BROKER',
      recipientName: adminUser.name,
      baseValue: 5500,
      percentage: 50,
      amount: 2750,
      status: 'PENDING',
      dueDate: new Date(),
    },
  })
  console.log('✅ Comissão criada')

  // 14. Create Company Usage
  await prisma.companyUsage.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      leadsCount: createdLeads.length,
      usersCount: 2,
      propertiesCount: createdProperties.length,
      contractsCount: 1,
      activeFlows: 0,
      flowExecMonth: 0,
      storageBytes: 0,
      pdfCount: 0,
    },
  })
  console.log('✅ Uso da empresa atualizado')

  console.log('')
  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📋 Dados criados:')
  console.log(`   • 1 Plano: ${plan.name}`)
  console.log(`   • 1 Empresa: ${company.name}`)
  console.log(`   • 2 Usuários`)
  console.log(`   • 1 Pipeline com 7 estágios`)
  console.log(`   • ${createdOwners.length} Proprietários`)
  console.log(`   • ${createdProperties.length} Imóveis`)
  console.log(`   • ${createdLeads.length} Leads`)
  console.log(`   • 20 Tarefas`)
  console.log(`   • 1 Contrato`)
  console.log(`   • 6 Lançamentos financeiros`)
  console.log(`   • 1 Comissão`)
  console.log('')
  console.log('🔐 Credenciais de teste:')
  console.log('   Admin: admin@demo.basium.com.br / demo123')
  console.log('   Corretor: corretor@demo.basium.com.br / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
