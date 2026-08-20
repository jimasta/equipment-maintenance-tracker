-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('TECNICO', 'SUPERVISOR', 'GESTOR');

-- CreateEnum
CREATE TYPE "IntervaloTipo" AS ENUM ('DIAS', 'HORAS_USO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ativo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "localizacao" TEXT NOT NULL,
    "dataAquisicao" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoManutencao" (
    "id" TEXT NOT NULL,
    "ativoId" TEXT NOT NULL,
    "intervaloTipo" "IntervaloTipo" NOT NULL,
    "intervaloValor" INTEGER NOT NULL,
    "estaAtivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanoManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroManutencao" (
    "id" TEXT NOT NULL,
    "planoManutencaoId" TEXT NOT NULL,
    "tecnicoId" TEXT NOT NULL,
    "dataExecucao" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "custo" DECIMAL(65,30) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "PlanoManutencao" ADD CONSTRAINT "PlanoManutencao_ativoId_fkey" FOREIGN KEY ("ativoId") REFERENCES "Ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroManutencao" ADD CONSTRAINT "RegistroManutencao_planoManutencaoId_fkey" FOREIGN KEY ("planoManutencaoId") REFERENCES "PlanoManutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroManutencao" ADD CONSTRAINT "RegistroManutencao_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
