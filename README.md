<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TypeORM-FE0902?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM"/>
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

<h1 align="center">🚗 Auto Finance API</h1>

A **Auto Finance API** é um sistema de backend robusto construído para automatizar e gerenciar processos de **financiamento de veículos**.

De forma bem simples e direta, esta API serve para:
- Cadastrar e listar veículos disponíveis para venda.
- Cadastrar clientes e definir qual é o limite de crédito aprovado para cada um.
- Registrar os vendedores que operam na plataforma.
- Simular e efetivar financiamentos: validando limites de crédito, vinculando clientes aos veículos e criando formalmente propostas de financiamento.

O sistema foi desenhado para ser totalmente seguro e consistente (transacional), protegendo a empresa contra falhas comuns, como vender o mesmo carro duas vezes ou aprovar financiamentos acima do limite do cliente.

---

## 🛠️ Tecnologias Utilizadas

- **NestJS** (Framework modular e escalável em Node.js)
- **TypeScript** (Tipagem estática para maior segurança)
- **PostgreSQL** (Banco de dados relacional)
- **TypeORM** (Mapeamento Objeto-Relacional)
- **Jest & Supertest** (Testes unitários e End-to-End)
- **Docker & Docker Compose** (Containerização e orquestração)
- **Swagger / Scalar** (Documentação interativa da API)

---

## 📖 Documentação da API

Toda a documentação das rotas, parâmetros, exemplos de requisições e esquemas de respostas está disponível de forma interativa.
Com a aplicação rodando, basta acessar pelo seu navegador:

👉 **`/api-docs`** (exemplo: `http://localhost:3000/api-docs`)

---

## 🚀 Como Executar o Projeto

Você tem duas formas de rodar o projeto: **usando Docker** (forma mais simples) ou **manualmente** na sua máquina.

### 1. Preparando o Ambiente (.env)
Antes de rodar, é obrigatório configurar as variáveis de ambiente. O projeto utiliza dois arquivos distintos: um para o ambiente de desenvolvimento/produção e outro exclusivo para testes automatizados.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/auto-finance-api.git
cd auto-finance-api

# Crie o ambiente principal a partir do exemplo
cp .env.example .env

# Crie o ambiente de testes a partir do exemplo
cp .env.example .env.test
```
> **Nota:** Certifique-se de que no `.env.test`, o banco de dados apontado seja diferente (ex: `auto-finance-bd-test`) do banco principal (`auto-finance`).

### 2. Rodando via Docker (Recomendado)
Com o Docker Compose, você sobe o banco de dados e a aplicação em um único comando:

```bash
# Sobe a aplicação e o PostgreSQL em background
docker compose up -d --build
```
A API estará rodando, as tabelas serão criadas e estará tudo pronto para uso!

### 3. Rodando Manualmente
Se preferir rodar o código no seu próprio Node.js e usar o Docker apenas para o banco:

```bash
# 3.1 Instale as dependências
npm install

# 3.2 Suba apenas o banco de dados (se possuir no docker-compose)
docker compose up -d db

# 3.3 Rode as migrações para criar as tabelas no banco de dados
npm run migration:run

# 3.4 Inicie a API em modo de desenvolvimento
npm run start:dev
```

---

## 🧪 Como Rodar os Testes

O projeto conta com uma suíte abrangente de testes para garantir a qualidade do código. Para os testes End-to-End (E2E), é essencial que o arquivo `.env.test` esteja configurado e que o banco de dados de teste esteja rodando.

```bash
# Executar testes unitários
npm run test

# Executar testes unitários e ver a cobertura de código (Coverage)
npm run test:cov

# Executar testes End-to-End (E2E)
# Este comando usa automaticamente o .env.test
npm run test:e2e
```

---

## 📂 Estrutura de Pastas

A arquitetura do projeto segue o padrão modular do NestJS, separando as responsabilidades por domínios de negócio:

```text
src/
├── app.module.ts                 # Módulo raiz principal
├── main.ts                       # Bootstrap de inicialização (Swagger, Pipes, etc.)
│
├── clients/                      # 🧑 Módulo Clientes (Cadastro e limite de crédito)
│   ├── clients.controller.ts
│   ├── clients.service.ts
│   └── entities/clients.entity.ts
│
├── vehicles/                     # 🚗 Módulo Veículos (Estoque e disponibilidade)
│   ├── vehicles.controller.ts
│   ├── vehicles.service.ts
│   └── entities/vehicles.entity.ts
│
├── sellers/                      # 💼 Módulo Vendedores
│   ├── sellers.controller.ts
│   ├── sellers.service.ts
│   └── entities/sellers.entity.ts
│
├── sales/                        # 🛒 Módulo Vendas (Faturamento e Simulações)
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   ├── use-cases/                # Lógicas complexas (liquidar, estornar)
│   └── entities/
│       ├── sales.entity.ts
│       └── financings.entity.ts
│
├── database/                     # 🗄️ Configuração do Banco de Dados
│   ├── data-source.ts            # Config do TypeORM
│   └── migrations/               # Arquivos de migrações
│
└── shared/                       # 🛠️ Recursos Compartilhados
    ├── filters/                  # Tratamentos de erros globais
    └── interceptors/             # Transformações de resposta
```

---

## ✅ Requisitos Funcionais (RF)

Aqui estão as funcionalidades mapeadas para o sistema e seu status de desenvolvimento atual:

#### Gestão de Veículos
- [x] Deve ser possível realizar o cadastro de veículos.
- [x] Deve ser possível listar os veículos cadastrados.

#### Gestão de Clientes
- [x] Deve ser possível realizar o cadastro de clientes.
- [x] Deve ser possível listar os clientes cadastrados.

#### Simulação e Faturamento
- [ ] **Simulação de Margem:** Deve ser possível calcular se um cliente possui saldo suficiente para financiar um veículo (valor do carro menos entrada).
- [ ] **Faturamento de Venda:** Deve ser possível processar a venda, vinculando o cliente ao veículo vendido.

#### Gestão do Financiamento
- [ ] **Geração de Proposta:** Deve ser possível criar uma proposta com status inicial "Pendente" junto com o faturamento.
- [ ] **Liquidação:** Deve ser possível liquidar o financiamento (status "Liquidado").
- [ ] **Cancelamento/Estorno:** Deve ser possível cancelar o financiamento (status "Cancelado").

---

## ⚙️ Regras de Negócio (RN)

Para garantir que tudo funcione com segurança e consistência, a API aplica regras rigorosas:

- [ ] **Bloqueio de Concorrência:** Dois vendedores não podem vender o mesmo carro ao mesmo tempo. A primeira requisição trava a venda no banco, e a segunda deve retornar erro de conflito.
- [ ] **Validação Estrita de Limite:** O valor do financiamento não pode ultrapassar um centavo sequer do limite de crédito atual do cliente.
- [ ] **Atomicidade da Venda:** O faturamento engloba três ações no banco: deduzir limite do cliente, alterar status do carro e criar proposta. Se uma falhar, as outras são desfeitas (tudo ou nada).
- [ ] **Imutabilidade de Status:** Um veículo não "Disponível" não pode ser faturado. Financiamentos "Liquidados" ou "Cancelados" não podem sofrer novas alterações.
- [ ] **Recomposição de Margem:** Ao cancelar um faturamento, o limite de crédito é imediatamente devolvido ao cliente e o carro volta a ficar "Disponível".

---

Feito por [Emerson Neves](https://www.devemerson.site)
