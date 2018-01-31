import {Column, Entity, ManyToMany, PrimaryColumn, RelationOptions} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity("News")
export class NewsEntity {

  @PrimaryColumn()
  newsId: number;

  @Column()
  newsContext: number;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  content: string;

  @Column()
  createDate: number;

  @Column()
  updateDate: number;

  @ManyToMany(type => UserEntity, user => user.news, <RelationOptions>{cascadeAll: true, eager: true})
  users: Array<UserEntity>;
}
