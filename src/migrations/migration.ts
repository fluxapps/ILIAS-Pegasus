export interface Migration {

    /**
     * Run the migration
     */
    up():Promise<any>;

    /**
     * Reverse the migration
     */
    down():Promise<any>;

}

/**
 * How to create a new migration:
 * - Create a new ts file in migrations
 * - Create a new class extending BaseMigration and implement up() and down()
 * - Add your migration to the services/migrations.service.ts file so it gets executed when starting the app
 */
export class BaseMigration implements Migration {

    constructor() {
    }

    up():Promise<any> {
        return Promise.resolve();
    }

    down():Promise<any> {
        return Promise.resolve();
    }

}