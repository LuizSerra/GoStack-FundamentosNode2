/* eslint-disable no-param-reassign */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const balance = transactions.reduce(
      (acumulador: Balance, valor: Transaction) => {
        if (valor.type === 'income') {
          acumulador.income += Number(valor.value);
        } else if (valor.type === 'outcome') {
          acumulador.outcome += Number(valor.value);
        }
        acumulador.total = acumulador.income - acumulador.outcome;
        return acumulador;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    return balance;
  }
}

export default TransactionsRepository;
