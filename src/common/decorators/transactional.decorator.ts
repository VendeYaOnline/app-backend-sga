import { DataSource } from 'typeorm';

export function Transactional() {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalMethod = descriptor.value;
    descriptor.value = async function (
      this: { dataSource: DataSource },
      ...args: unknown[]
    ) {
      const dataSource: DataSource = this.dataSource;
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const result = await originalMethod.apply(this, [
          ...args,
          queryRunner.manager,
        ]);
        await queryRunner.commitTransaction();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };
  };
}
