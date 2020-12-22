import { Migration, MigrationVersion } from "../services/migration/migration.api";
import { QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm/browser";

/**
 * Migration for Lernorte 2.0.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.6
 */
export class CreateLearnplace implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__3");

    async up(queryRunner: QueryRunner): Promise<void> {

        try {
            await queryRunner.startTransaction();

            const learnplace: Table = new Table({
                name: "Learnplace",
                columns: [
                    new TableColumn({name: "id", type: "string", length: "38", isPrimary: true, isNullable: false}),
                    new TableColumn({name: "objectId", type: "integer", isNullable: false}),
                    new TableColumn({name: "FK_user", type: "integer", isNullable: false})
                ]
            });

            const visitJournal: Table = new Table({
                name: "VisitJournal",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isGenerated: true,
                        isNullable: false
                    }),
                    new TableColumn({name: "userId", type: "integer", isNullable: false}),
                    new TableColumn({name: "time", type: "integer", isNullable: false}),
                    new TableColumn({name: "synchronized", type: "boolean", isNullable: false}),
                    new TableColumn({name: "FK_learnplace", type: "string", length: "38", isNullable: false})
                ]
            });

            const visibility: Table = new Table({
                name: "Visibility",
                columns: [
                    new TableColumn({name: "value", type: "string", length: "128", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const location: Table = new Table({
                name: "Location",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isGenerated: true,
                        isNullable: false
                    }),
                    new TableColumn({name: "latitude", type: "double", isNullable: false}),
                    new TableColumn({name: "longitude", type: "double", isNullable: false}),
                    new TableColumn({name: "elevation", type: "double", isNullable: false}),
                    new TableColumn({name: "radius", type: "integer", isNullable: false}),
                    new TableColumn({name: "FK_learnplace", type: "string", length: "38", isNullable: false})
                ]
            });

            const map: Table = new Table({
                name: "Map",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isNullable: false,
                        isGenerated: true
                    }),
                    new TableColumn({name: "zoom", type: "integer", isNullable: false}),
                    new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false}),
                    new TableColumn({name: "FK_learnplace", type: "string", length: "38", isNullable: false})
                ]
            });

            const accordion: Table = new Table({
                name: "Accordion",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isNullable: false,
                        isGenerated: true
                    }),
                    new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
                    new TableColumn({name: "sequence", type: "integer", isNullable: false}),
                    new TableColumn({name: "title", type: "string", length: "256", isNullable: false}),
                    new TableColumn({name: "expanded", type: "boolean", isNullable: false}),
                    new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
                ]
            });

            const learnplaceAccordionJunction: Table = new Table({
                name: "learnplace_accordion",
                columns: [
                    new TableColumn({name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const textBlock: Table = new Table({
                name: "TextBlock",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isNullable: false,
                        isGenerated: true
                    }),
                    new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
                    new TableColumn({name: "content", type: "string", length: "5000", isNullable: false}),
                    new TableColumn({name: "sequence", type: "integer", isNullable: false}),
                    new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
                ]
            });

            const learnplaceTextblockJunction: Table = new Table({
                name: "learnplace_textblock",
                columns: [
                    new TableColumn({name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "textblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const accordionTextblockJunction: Table = new Table({
                name: "accordion_textblock",
                columns: [
                    new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "textblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const pictureBlock: Table = new Table({
                name: "PictureBlock",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isNullable: false,
                        isGenerated: true
                    }),
                    new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
                    new TableColumn({name: "sequence", type: "integer", isNullable: false}),
                    new TableColumn({name: "title", type: "string", length: "256", isNullable: false}),
                    new TableColumn({name: "description", type: "string", length: "2000", isNullable: false}),
                    new TableColumn({name: "thumbnail", type: "string", length: "256", isNullable: false}),
                    new TableColumn({name: "thumbnailHash", type: "string", length: "64", isNullable: false}),
                    new TableColumn({name: "url", type: "string", length: "256", isNullable: false}),
                    new TableColumn({name: "hash", type: "string", length: "64", isNullable: false}),
                    new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
                ]
            });

            const learnplacePictureblockJunction: Table = new Table({
                name: "learnplace_pictureblock",
                columns: [
                    new TableColumn({name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "pictureblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const accordionPictureblockJunction: Table = new Table({
                name: "accordion_pictureblock",
                columns: [
                    new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "pictureblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const linkBlock: Table = new Table({
                name: "LinkBlock",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isNullable: false,
                        isGenerated: true
                    }),
                    new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
                    new TableColumn({name: "sequence", type: "integer", isNullable: false}),
                    new TableColumn({name: "refId", type: "integer", isNullable: false}),
                    new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
                ]
            });

            const learnplaceLinkblockJunction: Table = new Table({
                name: "learnplace_linkblock",
                columns: [
                    new TableColumn({name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "linkblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const accordionLinkblockJunction: Table = new Table({
                name: "accordion_linkblock",
                columns: [
                    new TableColumn({name: "accordionId", type: "integer", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "linkblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const videoBlock: Table = new Table({
                name: "VideoBlock",
                columns: [
                    new TableColumn({
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        generationStrategy: "increment",
                        isNullable: false,
                        isGenerated: true
                    }),
                    new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
                    new TableColumn({name: "sequence", type: "integer", isNullable: false}),
                    new TableColumn({name: "url", type: "string", length: "256", isNullable: false}),
                    new TableColumn({name: "hash", type: "string", length: "64", isNullable: false}),
                    new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
                ]
            });

            const learnplaceVideoblockJunction: Table = new Table({
                name: "learnplace_videoblock",
                columns: [
                    new TableColumn({name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "videoblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            const accordionVideoblockJunction: Table = new Table({
                name: "accordion_videoblock",
                columns: [
                    new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
                    new TableColumn({name: "videoblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
                ]
            });

            await queryRunner.createTable(learnplace);
            await queryRunner.createTable(visitJournal);
            await queryRunner.createTable(visibility);
            await queryRunner.createTable(location);
            await queryRunner.createTable(map);
            await queryRunner.createTable(accordion);
            await queryRunner.createTable(learnplaceAccordionJunction);
            await queryRunner.createTable(textBlock);
            await queryRunner.createTable(learnplaceTextblockJunction);
            await queryRunner.createTable(accordionTextblockJunction);
            await queryRunner.createTable(pictureBlock);
            await queryRunner.createTable(learnplacePictureblockJunction);
            await queryRunner.createTable(accordionPictureblockJunction);
            await queryRunner.createTable(linkBlock);
            await queryRunner.createTable(learnplaceLinkblockJunction);
            await queryRunner.createTable(accordionLinkblockJunction);
            await queryRunner.createTable(videoBlock);
            await queryRunner.createTable(learnplaceVideoblockJunction);
            await queryRunner.createTable(accordionVideoblockJunction);


            // await queryRunner.insert("Visibility", {value: "ALWAYS"});
            await queryRunner.query("INSERT INTO Visibility (value) VALUES ('ALWAYS'), ('NEVER'), ('ONLY_AT_PLACE'), ('AFTER_VISIT_PLACE');");
            //await queryRunner.insert("Visibility", {value: "NEVER"});
            //await queryRunner.insert("Visibility", {value: "ONLY_AT_PLACE"});
            //await queryRunner.insert("Visibility", {value: "AFTER_VISIT_PLACE"});

            await queryRunner.createForeignKey(visitJournal, new TableForeignKey({
                name: "visitJournal_FK_learnplace_learnplace_id",
                columnNames: ["FK_learnplace"],
                referencedColumnNames: ["id"],
                referencedTableName: learnplace.name,
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }));

            await queryRunner.createForeignKey(location, new TableForeignKey({
                name: "location_FK_learnplace_learnplace_id",
                columnNames: ["FK_learnplace"],
                referencedColumnNames: ["id"],
                referencedTableName: learnplace.name,
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }));

            await queryRunner.createForeignKeys(learnplaceAccordionJunction,
                [
                    new TableForeignKey({
                            name: "accordion_learnplace_junc",
                            columnNames: ["learnplaceId"],
                            referencedColumnNames: ["id"],
                            referencedTableName: learnplace.name,
                            onUpdate: "CASCADE",
                            onDelete: "CASCADE"

                        }
                    ),
                    new TableForeignKey({
                            name: "learnplace_accordion_junc",
                            columnNames: ["accordionId"],
                            referencedColumnNames: ["id"],
                            referencedTableName: accordion.name,
                            onUpdate: "CASCADE",
                            onDelete: "CASCADE"
                        }
                    )
                ]);

            await queryRunner.createForeignKeys(learnplaceTextblockJunction, [
                new TableForeignKey(
                    {
                        name: "textblock_learnplace_junc",
                        columnNames: ["learnplaceId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: learnplace.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "learnplace_textblock_junc",
                        columnNames: ["textblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: textBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKeys(learnplacePictureblockJunction, [
                new TableForeignKey(
                    {
                        name: "pictureblock_learnplace_junc",
                        columnNames: ["learnplaceId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: learnplace.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "learnplace_pictureblock_junc",
                        columnNames: ["pictureblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: pictureBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKeys(learnplaceLinkblockJunction, [
                new TableForeignKey(
                    {
                        name: "linkblock_learnplace_junc",
                        columnNames: ["learnplaceId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: learnplace.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "learnplace_linkblock_junc",
                        columnNames: ["linkblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: linkBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKeys(learnplaceVideoblockJunction, [
                new TableForeignKey(
                    {
                        name: "videoblock_learnplace_junc",
                        columnNames: ["learnplaceId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: learnplace.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "learnplace_videoblock_junc",
                        columnNames: ["videoblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: videoBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            //------- accordion junc -------------

            await queryRunner.createForeignKeys(accordionTextblockJunction, [
                new TableForeignKey(
                    {
                        name: "textblock_accordion_junc",
                        columnNames: ["accordionId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: accordion.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "accordion_textblock_junc",
                        columnNames: ["textblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: textBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKeys(accordionPictureblockJunction, [
                new TableForeignKey(
                    {
                        name: "pictureblock_accordion_junc",
                        columnNames: ["accordionId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: accordion.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "accordion_pictureblock_junc",
                        columnNames: ["pictureblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: pictureBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKeys(accordionLinkblockJunction, [
                new TableForeignKey(
                    {
                        name: "linkblock_accordion_junc",
                        columnNames: ["accordionId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: accordion.name,
                        onUpdate: "",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "accordion_linkblock_junc",
                        columnNames: ["linkblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: linkBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKeys(accordionVideoblockJunction, [
                new TableForeignKey(
                    {
                        name: "videoblock_accordion_junc",
                        columnNames: ["accordionId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: accordion.name,
                        onUpdate: "",
                        onDelete: "CASCADE"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "accordion_videoblock_junc",
                        columnNames: ["videoblockId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: videoBlock.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            // -------------- visibility ----------------

            //only one create foreign key per table works ...
            await queryRunner.createForeignKeys(map, [
                new TableForeignKey(
                    {
                        name: "map_visibility",
                        columnNames: ["FK_visibility"],
                        referencedColumnNames: ["value"],
                        referencedTableName: visibility.name,
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT"
                    }
                ),
                new TableForeignKey(
                    {
                        name: "map_FK_learnplace_learnplace_id",
                        columnNames: ["FK_learnplace"],
                        referencedColumnNames: ["id"],
                        referencedTableName: learnplace.name,
                        onUpdate: "CASCADE",
                        onDelete: "CASCADE"
                    }
                )
            ]);

            await queryRunner.createForeignKey(textBlock,
                new TableForeignKey(
                    {
                        name: "textblock_visibility",
                        columnNames: ["FK_visibility"],
                        referencedColumnNames: ["value"],
                        referencedTableName: visibility.name,
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT"
                    }
                )
            );

            await queryRunner.createForeignKey(accordion,
                new TableForeignKey(
                    {
                        name: "accordion_visibility",
                        columnNames: ["FK_visibility"],
                        referencedColumnNames: ["value"],
                        referencedTableName: visibility.name,
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT"
                    }
                )
            );

            await queryRunner.createForeignKey(pictureBlock,
                new TableForeignKey(
                    {
                        name: "pictureblock_visibility",
                        columnNames: ["FK_visibility"],
                        referencedColumnNames: ["value"],
                        referencedTableName: visibility.name,
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT"
                    }
                )
            );

            await queryRunner.createForeignKey(linkBlock,
                new TableForeignKey(
                    {
                        name: "link_visibility",
                        columnNames: ["FK_visibility"],
                        referencedColumnNames: ["value"],
                        referencedTableName: visibility.name,
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT"
                    }
                )
            );

            await queryRunner.createForeignKey(videoBlock,
                new TableForeignKey(
                    {
                        name: "videoblock_visibility",
                        columnNames: ["FK_visibility"],
                        referencedColumnNames: ["value"],
                        referencedTableName: visibility.name,
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT"
                    }
                )
            );
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        }
    }


    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("Map");
        await queryRunner.dropTable("Location");
        await queryRunner.dropTable("Visibility");
        await queryRunner.dropTable("TextBlock");
        await queryRunner.dropTable("learnplace_textblock");
        await queryRunner.dropTable("accordion_textblock");
        await queryRunner.dropTable("PictureBlock");
        await queryRunner.dropTable("learnplace_pictureblock");
        await queryRunner.dropTable("accordion_pictureblock");
        await queryRunner.dropTable("LinkBLock");
        await queryRunner.dropTable("learnplace_linkblock");
        await queryRunner.dropTable("accordion_linkblock");
        await queryRunner.dropTable("VideoBlock");
        await queryRunner.dropTable("learnplace_videoblock");
        await queryRunner.dropTable("accordion_videoblock");
        await queryRunner.dropTable("Accordion");
        await queryRunner.dropTable("learnplace_accordion");
        await queryRunner.dropTable("VisitJournal");
        await queryRunner.dropTable("Learnplace");
    }
}
