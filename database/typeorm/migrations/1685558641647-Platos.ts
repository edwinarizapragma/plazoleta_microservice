import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Platos1685558641647 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'platos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
          },
          {
            name: 'id_categoria',
            type: 'int',
          },
          {
            name: 'descripcion',
            type: 'varchar',
          },
          {
            name: 'precio',
            type: 'decimal',
          },
          {
            name: 'id_restaurante',
            type: 'int',
          },
          {
            name: 'url_imagen',
            type: 'text',
          },
          {
            name: 'activo',
            type: 'boolean',
          },
        ],
      }),
      true,
    );
    await queryRunner.createForeignKey(
      'platos',
      new TableForeignKey({
        columnNames: ['id_categoria'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categorias',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'platos',
      new TableForeignKey({
        columnNames: ['id_restaurante'],
        referencedColumnNames: ['id'],
        referencedTableName: 'restaurantes',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('platos');
  }
}
