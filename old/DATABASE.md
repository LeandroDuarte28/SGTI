Adicionar entidades:

FinancialEntry

FinancialCategory

CostCenter

Supplier

Project

PurchaseOrder

Invoice

Budget

BudgetItem

Relacionamentos:

Project
   |
   +--- FinancialEntry

FinancialEntry
   |
   +--- Request

Request
   |
   +--- Asset

Asset
   |
   +--- Supplier

Supplier
   |
   +--- PurchaseOrder