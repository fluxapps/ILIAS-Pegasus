import {
  Entity,
  JoinColumn, JoinColumnOptions, JoinTable, JoinTableOptions, ManyToMany, OneToOne,
  RelationOptions
} from "typeorm";
import {LinkblockEntity} from "./linkblock.entity";
import {PictureBlockEntity} from "./pictureBlock.entity";
import {VideoBlockEntity} from "./videoblock.entity";
import {TextblockEntity} from "./textblock.entity";
import {VisibilityEntity} from "./visibility.entity";

@Entity("Accordion")
export class AccordionEntity {

  id: number;

  iliasId: number;

  sequence: number;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @ManyToMany(type => TextblockEntity, <RelationOptions>{
    cascadeInsert: true,
    cascadeUpdate: true,
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
    eager: true
  })
  @JoinTable(<JoinTableOptions>{
    name: "accordion_videoblock",
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
