# Auto Finance API

## 1. Requisitos Funcionais (RF)

#### Gestão de Veículos

- [ ] Deve ser possível realizar o cadastro de veículos;
- [ ] Deve ser possível listar os veículos cadastrados;

#### Gestão de Clientes

- [ ] Deve ser possível realizar o cadastro de clientes;
- [ ] Deve ser possível listar os clientes cadastrados;

#### Simulação de Margem

- [ ] Deve ser possível calcular se um cliente possui saldo suficiente para financiar um determinado veículo, considerando o valor do carro menos a entrada (se houver).

#### Faturamento de Venda

- [ ] Deve ser possível processar a venda, vinculando o cliente ao veículo vendido.

#### Geração de Proposta de Financiamento

- [ ] Deve ser possível processar a venda, vinculando o cliente ao veículo vendido.

#### Geração de Proposta de Financiamento

- [ ] Deve ser possível criar uma proposta de financiamento com status inicial "Pendente", juntamente com o faturamento.

#### Liquidação de Financiamento

- [ ] Deve ser possível liquidar o financiamento, alterando o status da proposta para "Liquidado".

#### Cancelamento/Estorno de Financiamento

- [ ] Deve ser possível cancelar/estornar o financiamento, alterando o status da proposta para "Cancelado

## 2. Regras de Negócio (RN)

- [ ] **Bloqueio de Concorrência:** Dois vendedores não podem vender o mesmo carro ao mesmo tempo. Se houver duas requisições simultâneas de faturamento para o mesmo ID de veículo, a primeira deve travar o registro no banco e a segunda deve ser rejeitada com erro de conflito.
- [ ] **Validação Estrita de Limite:** O valor do financiamento não pode, em nenhuma hipótese, ultrapassar um único centavo do limite de crédito atual do cliente.
- [ ] **Atomicidade da Venda:** O processo de faturamento engloba três ações no banco: deduzir o limite do cliente, alterar o status do carro e criar a proposta. Se qualquer uma falhar, as outras duas devem ser desfeitas. Tudo ou nada.
- [ ] **Imutabilidade de Status:** Um veículo que não esteja com o status "Disponível" não pode ser faturado. Um financiamento com status "Liquidado" ou "Cancelado" não pode sofrer novas alterações de estado.
- [ ] **Recomposição de Margem:** Se um faturamento for cancelado por recusa, o limite de crédito deduzido deve ser imediatamente devolvido ao saldo disponível do cliente, e o status do veículo deve voltar para "Disponível".
