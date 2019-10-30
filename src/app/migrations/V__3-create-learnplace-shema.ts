import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm/browser";

/**
 * Migration for Lernorte 2.0.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.6
 */
export class CreateLearnplace implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__3");

    async up(queryRunner: QueryRunner): Promise<void> {

        const learnplace: Table = new Table("Learnplace", [
            new TableColumn({name: "id", type: "string",length: "38", isPrimary: true, isNullable: false}),
            new TableColumn({name: "objectId", type: "integer", isNullable: false}),
            new TableColumn({name: "FK_user", type: "integer", isNullable: false})
        ]);

        const visitJournal: Table = new Table("VisitJournal", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isGenerated: true, isNullable: false}),
            new TableColumn({name: "userId", type: "integer", isNullable: false}),
            new TableColumn({name: "time", type: "integer", isNullable: false}),
            new TableColumn({name: "synchronized", type: "boolean", isNullable: false}),
            new TableColumn({name: "FK_learnplace", type: "string" ,length: "38", isNullable: false})
        ]);

        const visibility: Table = new Table("Visibility", [
            new TableColumn({name: "value", type: "string", length: "128", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const location: Table = new Table("Location", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isGenerated: true, isNullable: false}),
            new TableColumn({name: "latitude", type: "double", isNullable: false}),
            new TableColumn({name: "longitude", type: "double", isNullable: false}),
            new TableColumn({name: "elevation", type:"double", isNullable: false}),
            new TableColumn({name: "radius", type: "integer", isNullable: false}),
            new TableColumn({name: "FK_learnplace", type: "string", length: "38", isNullable: false})
        ]);

        const map: Table = new Table("Map", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true}),
            new TableColumn({name: "zoom", type: "integer", isNullable: false}),
            new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false}),
            new TableColumn({name: "FK_learnplace", type: "string", length: "38", isNullable: false})
        ]);

        const accordion: Table = new Table("Accordion", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true}),
            new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
            new TableColumn({name: "sequence", type: "integer", isNullable: false}),
            new TableColumn({name: "title", type: "string", length: "256", isNullable: false}),
            new TableColumn({name: "expanded", type: "boolean", isNullable: false}),
            new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
        ]);

        const learnplaceAccordionJunction: Table = new Table("learnplace_accordion", [
            new TableColumn({name: "learnplaceId", type: "string", length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const textBlock: Table = new Table("TextBlock", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true}),
            new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
            new TableColumn({name: "content", type: "string", length: "5000", isNullable: false}),
            new TableColumn({name: "sequence", type: "integer", isNullable: false}),
            new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
        ]);

        const learnplaceTextblockJunction: Table = new Table("learnplace_textblock", [
            new TableColumn({name: "learnplaceId", type: "string" ,length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "textblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const accordionTextblockJunction: Table = new Table("accordion_textblock", [
            new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "textblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const pictureBlock: Table = new Table("PictureBlock", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true}),
            new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
            new TableColumn({name: "sequence", type: "integer", isNullable: false}),
            new TableColumn({name: "title", type: "string", length: "256", isNullable: false}),
            new TableColumn({name: "description", type: "string", length: "2000", isNullable: false}),
            new TableColumn({name: "thumbnail", type: "string", length: "256", isNullable: false}),
            new TableColumn({name: "thumbnailHash", type: "string", length: "64", isNullable: false}),
            new TableColumn({name: "url", type: "string", length: "256", isNullable: false}),
            new TableColumn({name: "hash", type: "string", length: "64", isNullable: false}),
            new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
        ]);

        const learnplacePictureblockJunction: Table = new Table("learnplace_pictureblock", [
            new TableColumn({name: "learnplaceId", type: "string" ,length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "pictureblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const accordionPictureblockJunction: Table = new Table("accordion_pictureblock", [
            new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "pictureblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const linkBlock: Table = new Table("LinkBlock",[
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true}),
            new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
            new TableColumn({name: "sequence", type: "integer", isNullable: false}),
            new TableColumn({name: "refId", type: "integer", isNullable: false}),
            new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
        ]);

        const learnplaceLinkblockJunction: Table = new Table("learnplace_linkblock", [
            new TableColumn({name: "learnplaceId", type: "string" ,length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "linkblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const accordionLinkblockJunction: Table = new Table("accordion_linkblock", [
            new TableColumn({name: "accordionId", type: "integer" ,length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "linkblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const videoBlock: Table = new Table("VideoBlock", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, generationStrategy: "increment", isNullable: false, isGenerated: true}),
            new TableColumn({name: "iliasId", type: "integer", isNullable: false}),
            new TableColumn({name: "sequence", type: "integer", isNullable: false}),
            new TableColumn({name: "url", type: "string", length: "256", isNullable: false}),
            new TableColumn({name: "hash", type: "string", length: "64", isNullable: false}),
            new TableColumn({name: "FK_visibility", type: "string", length: "128", isNullable: false})
        ]);

        const learnplaceVideoblockJunction: Table = new Table("learnplace_videoblock", [
            new TableColumn({name: "learnplaceId", type: "string" ,length: "38", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "videoblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

        const accordionVideoblockJunction: Table = new Table("accordion_videoblock", [
            new TableColumn({name: "accordionId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
            new TableColumn({name: "videoblockId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false})
        ]);

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

        await queryRunner.insert("Visibility", {value: "ALWAYS"});
        await queryRunner.insert("Visibility", {value: "NEVER"});
        await queryRunner.insert("Visibility", {value: "ONLY_AT_PLACE"});
        await queryRunner.insert("Visibility", {value: "AFTER_VISIT_PLACE"});

        await queryRunner.createForeignKey(visitJournal, new TableForeignKey(
            "visitJournal_FK_learnplace_learnplace_id",
            ["FK_learnplace"],
            ["id"],
            learnplace.name,
            "",
            "CASCADE"
        ));

        await queryRunner.createForeignKey(location, new TableForeignKey(
            "location_FK_learnplace_learnplace_id",
            ["FK_learnplace"],
            ["id"],
            learnplace.name,
            "",
            "CASCADE"
        ));

        await queryRunner.createForeignKeys(learnplaceAccordionJunction,
            [
                new TableForeignKey(
                "accordion_learnplace_junc",
                ["learnplaceId"],
                ["id"],
                        learnplace.name,
                "",
                "CASCADE"
            ),
                new TableForeignKey(
                    "learnplace_accordion_junc",
                    ["accordionId"],
                    ["id"],
                    accordion.name,
                    "",
                    "CASCADE"
                )
            ]);

        await queryRunner.createForeignKeys(learnplaceTextblockJunction, [
            new TableForeignKey(
                "textblock_learnplace_junc",
                ["learnplaceId"],
                ["id"],
                learnplace.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "learnplace_textblock_junc",
                ["textblockId"],
                ["id"],
                textBlock.name,
                "",
                "CASCADE"
            )
        ]);

        await queryRunner.createForeignKeys(learnplacePictureblockJunction, [
            new TableForeignKey(
                "pictureblock_learnplace_junc",
                ["learnplaceId"],
                ["id"],
                learnplace.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "learnplace_pictureblock_junc",
                ["pictureblockId"],
                ["id"],
                pictureBlock.name,
                "",
                "CASCADE"
            )
        ]);

        await queryRunner.createForeignKeys(learnplaceLinkblockJunction, [
            new TableForeignKey(
                "linkblock_learnplace_junc",
                ["learnplaceId"],
                ["id"],
                learnplace.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "learnplace_linkblock_junc",
                ["linkblockId"],
                ["id"],
                linkBlock.name,
                "",
                "CASCADE"
            )
        ]);

        await queryRunner.createForeignKeys(learnplaceVideoblockJunction, [
            new TableForeignKey(
                "videoblock_learnplace_junc",
                ["learnplaceId"],
                ["id"],
                learnplace.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "learnplace_videoblock_junc",
                ["videoblockId"],
                ["id"],
                videoBlock.name,
                "",
                "CASCADE"
            )
        ]);

        //------- accordion junc -------------

        await queryRunner.createForeignKeys(accordionTextblockJunction, [
            new TableForeignKey(
                "textblock_accordion_junc",
                ["accordionId"],
                ["id"],
                accordion.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "accordion_textblock_junc",
                ["textblockId"],
                ["id"],
                textBlock.name,
                "",
                "CASCADE"
            )
        ]);

        await queryRunner.createForeignKeys(accordionPictureblockJunction, [
            new TableForeignKey(
                "pictureblock_accordion_junc",
                ["accordionId"],
                ["id"],
                accordion.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "accordion_pictureblock_junc",
                ["pictureblockId"],
                ["id"],
                pictureBlock.name,
                "",
                "CASCADE"
            )
        ]);

        await queryRunner.createForeignKeys(accordionLinkblockJunction, [
            new TableForeignKey(
                "linkblock_accordion_junc",
                ["accordionId"],
                ["id"],
                accordion.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "accordion_linkblock_junc",
                ["linkblockId"],
                ["id"],
                linkBlock.name,
                "",
                "CASCADE"
            )
        ]);

        await queryRunner.createForeignKeys(accordionVideoblockJunction, [
            new TableForeignKey(
                "videoblock_accordion_junc",
                ["accordionId"],
                ["id"],
                accordion.name,
                "",
                "CASCADE"
            ),
            new TableForeignKey(
                "accordion_videoblock_junc",
                ["videoblockId"],
                ["id"],
                videoBlock.name,
                "",
                "CASCADE"
            )
        ]);

        // -------------- visibility ----------------

        //only one create foreign key per table works ...
        await await queryRunner.createForeignKeys(map, [
                new TableForeignKey(
                    "map_visibility",
                    ["FK_visibility"],
                    ["value"],
                    visibility.name,
                    "",
                    "RESTRICT"
                ),
                new TableForeignKey(
                    "map_FK_learnplace_learnplace_id",
                    ["FK_learnplace"],
                    ["id"],
                    learnplace.name,
                    "",
                    "CASCADE"
                )
        ]);

        await await queryRunner.createForeignKey(textBlock,
            new TableForeignKey(
                "textblock_visibility",
                ["FK_visibility"],
                ["value"],
                visibility.name,
                "",
                "RESTRICT"
            )
        );

        await await queryRunner.createForeignKey(accordion,
            new TableForeignKey(
                "accordion_visibility",
                ["FK_visibility"],
                ["value"],
                visibility.name,
                "",
                "RESTRICT"
            )
        );

        await await queryRunner.createForeignKey(pictureBlock,
            new TableForeignKey(
                "pictureblock_visibility",
                ["FK_visibility"],
                ["value"],
                visibility.name,
                "",
                "RESTRICT"
            )
        );

        await await queryRunner.createForeignKey(linkBlock,
            new TableForeignKey(
                "link_visibility",
                ["FK_visibility"],
                ["value"],
                visibility.name,
                "",
                "RESTRICT"
            )
        );

        await await queryRunner.createForeignKey(videoBlock,
            new TableForeignKey(
                "videoblock_visibility",
                ["FK_visibility"],
                ["value"],
                visibility.name,
                "",
                "RESTRICT"
            )
        );
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
