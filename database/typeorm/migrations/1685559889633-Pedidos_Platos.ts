import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class PedidosPlatos1685559889633 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pedidos_platos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'id_pedido',
            type: 'int',
          },
          {
            name: 'id_plato',
            type: 'int',
          },
          {
            name: 'cantidad',
            type: 'int',
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'pedidos_platos',
      new TableForeignKey({
        columnNames: ['id_pedido'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pedidos',
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'pedidos_platos',
      new TableForeignKey({
        columnNames: ['id_plato'],
        referencedColumnNames: ['id'],
        referencedTableName: 'platos',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pedidos_platos');
  }
}
