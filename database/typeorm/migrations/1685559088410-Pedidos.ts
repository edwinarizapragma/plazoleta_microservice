import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Pedidos1685559088410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pedidos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'id_cliente',
            type: 'int',
          },
          {
            name: 'fecha',
            type: 'timestamp',
          },
          {
            name: 'estado',
            type: 'varchar',
          },
          {
            name: 'id_chef',
            type: 'int',
            isNullable: true,
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
      'pedidos',
      new TableForeignKey({
        columnNames: ['id_restaurante'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurantes',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pedidos');
  }
}
