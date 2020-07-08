import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);
    const categoryFound = await categoriesRepository.findOne({
      where: { title },
    });

    console.log(categoryFound);
    if (categoryFound) {
      throw new Error(
        'A category with this title already exist. Use another name',
      );
    }

    const category = categoriesRepository.create({ title });
    await categoriesRepository.save(category);

    return category;
  }
}
export default CreateCategoryService;
