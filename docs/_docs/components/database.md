---
title: Database
menuHeading: Components
sections:
    - Connection
    - Connection Types
    - Migration
---

# Connection

The ILIAS Pegasus database connection uses TypeORM to establish a database connection.

<http://typeorm.io>

**Features**

* Manage different connections
* Await until your connection is ready
* Configuration per configuration adapter

## Configuration

To configure a database connection, you have to implement the `DatabaseConfigurationAdapter` interface.

```typescript
@Injectable()
export class TypeORMConfigurationAdapter implements DatabaseConfigurationAdapter {

    addConnections(registry: DatabaseConnectionRegistry): void {
        registry.addConnection("your-connection-name",
            it => it.cordova()
                .setDatabase("your-database-name")
                .setLocation("default")
                .addEntity(
                    MyEntity
                )
        );
    }
}
```

There are one method you have to implement: `addConnection`. It provides a `DatabaseConnectionRegistry`
where you can configure your connection.

You add connections through the `DatabaseConnectionRegistry#addConnection` method.
The first parameter is your connection name, which must be unique. The second
parameter is a lambda expression which provides a `DatabaseConnection` object.

It allows you to select your connection type and set the connection options depending on your connection type.

**Provide your configuration adapter to Angular**

You must provide your configuration adapter to Angular by the inject token `DATABASE_CONFIGURATION_ADAPTER``.

In your ngModule under `providers`
```typescript
{
  provide: DATABASE_CONFIGURATION_ADAPTER,
  useClass: TypeORMConfigurationAdapter
}
```

> Only one configuration adapter can be provided at once

## Usage

To create or await your connection, you can use the `Database` class.

```typescript

@Injectable()
export class MyClass {
  
    constructor(
        private readonly database: Database
    ) {}
 
     async doStuff(): Promise<void> {
     
        await this.database.ready("your-connection-name");
        
        // now the connection is established and can be used.
        const connection: Connection = getConnection("your-connection-name");
    }
}
```

The first time you invoke the `ready` method, your connection will be established.
But you can invoke `ready` whenever you want to make sure, the connection is ready.

> Because ILIAS Pegasus relies on TypeORM, the easiest way to get your connection
> is the getConnection function of TypeORM.


## Connection Types

ILIAS Pegasus provides connection types through the `DatabaseConnection` object.
This object is available, in your `DatabaseConfigurationAdapter`.

Learn more about [DatabaseConfigurationAdapter](#configuration)

Because ILIAS Pegasus relies on TypeORM, we can only support connection types that
TypeORM supports.

Learn more about TypeORMs supported connections <http://typeorm.io/#/connection-options>

**ILIAS Pegasus supported connection types**

* Cordova

Although ILIAS Pegasus relies on TypeORM, we do not provide each possible option of TypeORM.
Some options must not be used, due problems with [Ionic](https://ionicframework.com/)
or conflicts with our app architecture.

> At the moment, we only support Cordova, because other types are not used yet.

# Migration

The ILIAS Pegasus database migration uses TypeORM for queries and database connection.

<http://typeorm.io>

**Features**

* QueryRunner of TypeORM for SQL statements
* Migration version validation and ordering

## Usage

Migrations are written in Typescript.

### Step 1 - Create a .ts file in `src/migrations`

> Migration files should follow the naming schema `V__<version>-<name>.ts`

### Step 2 - Implement the `Migration` interface

```typescript
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm";
 
 
export class InitDatabase implements Migration {
 
 
    readonly version: MigrationVersion = new MigrationVersion("V__1");
 
 
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE example ADD name TEXT NOT NULL");
    }
 
 
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE example DROP COLMUN name");
    }
}
```

There are two methods and one field you must fill with your migration code: `up` and `down`. `up` has to contain
the code you need to perform the migration. `down` has to revert whatever `up` changed.
`version` defines your migration version as well as the order of the migration. It
must follow the naming schema `V__<version>`, where `<version>` must be a positive natural number.

**Example**
* V__1
* V__2
* V__3

Inside both `up` and `down` you have a `QueryRunner` object. All database operations are executed using this object.

Learn more about [qurey runner](http://typeorm.io/#/query-runner/)

> Do not use the QueryBuilder#query method, but the QueryBuilder#createTable method.
> This lets you write your migrations independent of the SQL language used.

### Step 3 - Add your migration to the `MigrationSupplier`

At the moment, migrations are not picked up automatically. You have to manually
add your class to the `SimpleMigrationSupplier` class located in `src/services/migration/migration.service.ts`.

```typescript
@Injectable()
export class SimpleMigrationSupplier implements MigrationSupplier {

  async get(): Promise<Array<Migration>> {
    return [
      new InitDatabase(),
      new InsertData(),
      new AlterTable() // <-- add migration here
    ];
  }
}
```
