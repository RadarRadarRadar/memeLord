import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixShitPostColumnsMore1592182950069 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('shit_post', 'integer')) {
            await queryRunner.changeColumn(
                'shit_post',
                'integer',
                new TableColumn({
                    name: 'datetime',
                    type: 'bigint'
                })
            );
        }
    }

    public async down(): Promise<void> {
        // Move along!
    }
}
