import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
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
}
