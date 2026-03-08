-- AlterEnum
ALTER TYPE "Temperature" ADD VALUE 'FREEZING';

-- CreateIndex
CREATE INDEX "FlowExecution_companyId_idx" ON "FlowExecution"("companyId");

-- CreateIndex
CREATE INDEX "FlowExecution_flowId_idx" ON "FlowExecution"("flowId");

-- CreateIndex
CREATE INDEX "FlowExecution_leadId_idx" ON "FlowExecution"("leadId");

-- CreateIndex
CREATE INDEX "Lead_companyId_status_idx" ON "Lead"("companyId", "status");

-- CreateIndex
CREATE INDEX "Lead_companyId_stageId_idx" ON "Lead"("companyId", "stageId");

-- CreateIndex
CREATE INDEX "Lead_companyId_userId_idx" ON "Lead"("companyId", "userId");

-- CreateIndex
CREATE INDEX "Lead_pipelineId_idx" ON "Lead"("pipelineId");

-- CreateIndex
CREATE INDEX "LeadHistory_leadId_idx" ON "LeadHistory"("leadId");

-- CreateIndex
CREATE INDEX "LeadHistory_leadId_createdAt_idx" ON "LeadHistory"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "Task_companyId_idx" ON "Task"("companyId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condominium" ADD CONSTRAINT "Condominium_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
