import {LocationEntity} from "./location.entity";
import {MapEntity} from "./map.entity";
import {Entity, OneToMany, OneToOne, PrimaryColumn, RelationOptions} from "typeorm";
import {TextblockEntity} from "./textblock.entity";

@Entity("Learnplace")
export class LearnplaceEntity {

  @PrimaryColumn()
  objectId: number;

  @OneToOne(type => LocationEntity, location => location.learnplace, <RelationOptions>{cascadeAll: true, eager: true})
  location: LocationEntity;

  @OneToOne(type => MapEntity, map => map.learnplace, <RelationOptions>{cascadeAll: true, eager: true})
  map: MapEntity;

  @OneToMany(type => TextblockEntity, textBlock => textBlock.learnplace, <RelationOptions>{cascadeAll: true, eager: true})
  textBlocks: Array<TextblockEntity>;
}
