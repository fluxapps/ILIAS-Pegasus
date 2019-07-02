/** entries */
import {LinkblockEntity} from "./linkblock.entity";
import {PictureBlockEntity} from "./pictureBlock.entity";
import {VideoBlockEntity} from "./videoblock.entity";
import {TextblockEntity} from "./textblock.entity";
import {VisibilityEntity} from "./visibility.entity";
/** misc */
import {
    Column,
    Entity,
    JoinColumn,
    JoinColumnOptions,
    JoinTable,
    JoinTableOptions,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationOptions
} from "typeorm";


@Entity("Accordion")
export class AccordionEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iliasId: number;

  @Column()
  sequence: number;

  @Column()
  title: string;

  @Column()
  expanded: boolean;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @ManyToMany(type => TextblockEntity, <RelationOptions>{
      cascadeInsert: true,
      cascadeUpdate: true,
      cascadeRemove: false,
    eager: true
  })
  @JoinTable(<JoinTableOptions>{
    name: "accordion_textblock",
    joinColumn: <JoinColumnOptions>{
      name: "accordionId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: <JoinColumnOptions>{
      name: "textblockId",
      referencedColumnName: "id"
    }
  })
  textBlocks: Array<TextblockEntity>;

  @ManyToMany(type => PictureBlockEntity, <RelationOptions>{
      cascadeInsert: true,
      cascadeUpdate: true,
      cascadeRemove: false,
    eager: true
  })
  @JoinTable(<JoinTableOptions>{
    name: "accordion_pictureblock",
    joinColumn: <JoinColumnOptions>{
      name: "accordionId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: <JoinColumnOptions>{
      name: "pictureblockId",
      referencedColumnName: "id"
    }
  })
  pictureBlocks: Array<PictureBlockEntity>;


  @ManyToMany(type => LinkblockEntity, <RelationOptions>{
      cascadeInsert: true,
      cascadeUpdate: true,
      cascadeRemove: false,
    eager: true
  })
  @JoinTable(<JoinTableOptions>{
    name: "accordion_linkblock",
    joinColumn: <JoinColumnOptions>{
      name: "accordionId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: <JoinColumnOptions>{
      name: "linkblockId",
      referencedColumnName: "id"
    }
  })
  linkBlocks: Array<LinkblockEntity>;


  @ManyToMany(type => VideoBlockEntity, <RelationOptions>{
      cascadeInsert: true,
      cascadeUpdate: true,
      cascadeRemove: false,
    eager: true
  })
  @JoinTable(<JoinTableOptions>{
    name: "accordion_videoblock",
    joinColumn: <JoinColumnOptions>{
      name: "accordionId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: <JoinColumnOptions>{
      name: "videoblockId",
      referencedColumnName: "id"
    }
  })
  videoBlocks: Array<VideoBlockEntity>;
}
