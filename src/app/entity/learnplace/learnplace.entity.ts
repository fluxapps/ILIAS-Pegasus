import {
    Column,
    Entity,
    JoinColumn,
    JoinColumnOptions,
    JoinTable,
    JoinTableOptions,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    RelationOptions
} from "typeorm/browser";
import {TextblockEntity} from "./textblock.entity";
import {PictureBlockEntity} from "./pictureBlock.entity";
import {LinkblockEntity} from "./linkblock.entity";
import {VideoBlockEntity} from "./videoblock.entity";
import { VisibilityEntity } from "./visibility.entity";
import {AccordionEntity} from "./accordion.entity";
import {UserEntity} from "../user.entity";

@Entity("Location")
export class LocationEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    latitude: number;

    @Column()
    longitude: number;

    @Column()
    elevation: number;

    @Column()
    radius: number;

    @OneToOne(() => LearnplaceEntity, (type) => type.location)
    @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "id"})
    learnplace: unknown;
}

@Entity("Map")
export class MapEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    zoom: number;

    @OneToOne(() => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
    @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
    visibility: VisibilityEntity;

    @OneToOne(() => LearnplaceEntity, (type) => type.map)
    @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "id"})
    learnplace: unknown;
}

@Entity("Learnplace")
export class LearnplaceEntity {

    @PrimaryColumn()
    id: string;

    @Column()
    objectId: number;

    @OneToOne(() => UserEntity, <RelationOptions>{cascade: false, lazy: true})
    @JoinColumn(<JoinColumnOptions>{name: "FK_user", referencedColumnName: "id"})
    user: Promise<UserEntity>;

    @OneToOne(() => LocationEntity, (type) => type.learnplace, <RelationOptions>{cascade: true, eager: true})
    location: LocationEntity;

    @OneToOne(() => MapEntity, (type) => type.learnplace, <RelationOptions>{cascade: true, eager: true})
    map: MapEntity;

    @OneToMany(() => VisitJournalEntity, (type) => type.learnplace, <RelationOptions>{cascade: true, eager: true})
    visitJournal: Array<VisitJournalEntity>;

    @ManyToMany(() => AccordionEntity, <RelationOptions>{
        cascade: ["insert", "update"],
        eager: true
    })
    @JoinTable(<JoinTableOptions>{
        name: "learnplace_accordion",
        joinColumn: <JoinColumnOptions>{
            name: "learnplaceId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: <JoinColumnOptions>{
            name: "accordionId",
            referencedColumnName: "id"
        }
    })
    accordionBlocks: Array<AccordionEntity>;

    @ManyToMany(() => TextblockEntity, <RelationOptions>{
        cascade: ["insert", "update"],
        eager: true
    })
    @JoinTable(<JoinTableOptions>{
        name: "learnplace_textblock",
        joinColumn: <JoinColumnOptions>{
            name: "learnplaceId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: <JoinColumnOptions>{
            name: "textblockId",
            referencedColumnName: "id"
        }
    })
    textBlocks: Array<TextblockEntity>;

    @ManyToMany(() => PictureBlockEntity, <RelationOptions>{
        cascade: ["insert", "update"],
        eager: true
    })
    @JoinTable(<JoinTableOptions>{
        name: "learnplace_pictureblock",
        joinColumn: <JoinColumnOptions>{
            name: "learnplaceId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: <JoinColumnOptions>{
            name: "pictureblockId",
            referencedColumnName: "id"
        }
    })
    pictureBlocks: Array<PictureBlockEntity>;


    @ManyToMany(() => LinkblockEntity, <RelationOptions>{
        cascade: ["insert", "update"],
        eager: true
    })
    @JoinTable(<JoinTableOptions>{
        name: "learnplace_linkblock",
        joinColumn: <JoinColumnOptions>{
            name: "learnplaceId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: <JoinColumnOptions>{
            name: "linkblockId",
            referencedColumnName: "id"
        }
    })
    linkBlocks: Array<LinkblockEntity>;


    @ManyToMany(() => VideoBlockEntity, <RelationOptions>{
        cascade: ["insert", "update"],
        eager: true
    })
    @JoinTable(<JoinTableOptions>{
        name: "learnplace_videoblock",
        joinColumn: <JoinColumnOptions>{
            name: "learnplaceId",
            referencedColumnName: "id"
        },
        inverseJoinColumn: <JoinColumnOptions>{
            name: "videoblockId",
            referencedColumnName: "id"
        }
    })
    videoBlocks: Array<VideoBlockEntity>;
}

@Entity("VisitJournal")
export class VisitJournalEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    time: number;

    @Column()
    synchronized: boolean;

    @ManyToOne(() => LearnplaceEntity, (type) => type.visitJournal)
    @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace"})
    learnplace: LearnplaceEntity;
}
