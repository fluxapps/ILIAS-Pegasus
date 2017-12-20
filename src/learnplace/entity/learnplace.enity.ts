import {LocationEntity} from "./location.entity";
import {MapEntity} from "./map.entity";
import {Entity, JoinColumn, OneToOne, PrimaryColumn} from "typeorm";

@Entity()
export class LearnplaceEnity {

  @PrimaryColumn()
  objectId: number;

  @OneToOne(type => LocationEntity)
  @JoinColumn()
  location: LocationEntity;

  @OneToOne(type => MapEntity)
  @JoinColumn()
  map: MapEntity;
}
