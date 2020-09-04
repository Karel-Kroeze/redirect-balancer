import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from "typeorm";
import { Trial } from "./trial";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column({ type: "blob" })
    avatar?: string;

    @OneToMany((type) => Trial, (trial) => trial.user)
    trials!: Trial[];
}
