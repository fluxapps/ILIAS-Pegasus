import {Column, Entity, JoinColumnOptions, JoinTable, JoinTableOptions, ManyToMany, PrimaryColumn, RelationOptions} from "typeorm";
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

  @ManyToMany(type => NewsEntity, <RelationOptions>{
    cascadeInsert: true,
    cascadeUpdate: true,
    eager: true
  })
  @JoinTable(<JoinTableOptions>{
    name: "users_news",
    joinColumn: <JoinColumnOptions> {
      name: "usersId",
      referencedColumnName: "id"
    },
    inverseJoinColumn: <JoinColumnOptions> {
      name: "newsId",
      referencedColumnName: "newsId"
    }
  })
  news: Array<NewsEntity>;

}
