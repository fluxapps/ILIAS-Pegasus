import {LocationEntity} from "./location.entity";
import {MapEntity} from "./map.entity";
import {Entity, OneToOne, PrimaryColumn, RelationOptions} from "typeorm";

@Entity("Learnplace")
export class LearnplaceEnity {

  @PrimaryColumn()
  objectId: number;

  @OneToOne(type => LocationEntity, location => location.learnplace, <RelationOptions>{cascadeAll: true, eager: true})
  location: LocationEntity;

  @OneToOne(type => MapEntity, map => map.learnplace, <RelationOptions>{cascadeAll: true, eager: true})
  map: MapEntity;
}
