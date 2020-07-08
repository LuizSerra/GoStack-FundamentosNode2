/* eslint-disable no-restricted-syntax */
import path from 'path';
import { getRepository, getCustomRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import loadCSV from '../importCSV/importCSV';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const lines = await loadCSV(csvFilePath);
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categories = [];
    const transcs = [];

    // cria o array de categorias e de transações baseado nas linhas
    for (const line of lines) {
      const [title, type, value, category] = line;
      categories.push(category);
      transcs.push({ title, type, value, category });
    }
    // verifica quais categorias já existem na base
    const existsCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // Obtém o título das categorias existentes
    const existentTitle = existsCategories.map((c: Category) => c.title);

    // verifica quais categorias das linhas precisam ser inseridas
    const addCategories = categories
      .filter(category => !existentTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    // adiciona as categorias que necessitavam ser inseridas
    const newCategories = categoriesRepository.create(
      addCategories.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    // mescla os arrays com todas as categorias da base e novas
    const categoriesFinal = [...newCategories, ...existsCategories];

    // insere as transações. Busca categoria a ser inserida na transação pelo titulo
    const createdTransactions = transactionsRepository.create(
      transcs.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: categoriesFinal.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
