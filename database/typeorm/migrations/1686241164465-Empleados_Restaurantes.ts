import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class EmpleadoRestaurante1686241164465 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'empleados_restaurantes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'id_empleado',
            type: 'int',
          },
          {
            name: 'id_restaurante',
            type: 'int',
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'empleados_restaurantes',
      new TableForeignKey({
        columnNames: ['id_restaurante'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurantes',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('empleados_restaurantes');
  }
}
