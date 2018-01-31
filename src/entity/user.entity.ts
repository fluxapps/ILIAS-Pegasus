import {Column, Entity, JoinTable, ManyToMany, PrimaryColumn, RelationOptions} from "typeorm";
import {NewsEntity} from "./news.entity";

@Entity("users")
export class UserEntity {

  @PrimaryColumn()
  id: number;

  @Column()
  iliasUserId: number;

  @Column()
  iliasLogin: string;

  @Column()
  installationId: number;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  lastTokenUpdate: number;

  @ManyToMany(type => NewsEntity, news => news.users, <RelationOptions>{cascadeAll: true, eager: true})
  @JoinTable()
  news: Array<NewsEntity>;

}
