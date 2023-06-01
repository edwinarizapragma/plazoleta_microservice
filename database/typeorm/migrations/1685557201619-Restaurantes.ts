import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Restaurantes1685557201619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'restaurantes',
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
            name: 'direccion',
            type: 'varchar',
          },
          {
            name: 'id_propietario',
            type: 'int',
          },
          {
            name: 'telefono',
            type: 'varchar',
          },
          {
            name: 'url_logo',
            type: 'text',
          },
          {
            name: 'nit',
            type: 'bigint',
            isUnique: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('restaurantes');
  }
}
