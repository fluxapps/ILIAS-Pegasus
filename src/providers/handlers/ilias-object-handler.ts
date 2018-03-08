import {ILIASObject} from "../../models/ilias-object";
import {User} from "../../models/user";

export interface DataProviderILIASObjectHandler {
    /**
     * Executed after the given iliasObject has been saved to local DB by given user
     * @param iliasObject
     * @param user
     */
    onSave(iliasObject: ILIASObject, user: User): Promise<ILIASObject>

    /**
     * Executed after the given iliasObject has been deleted from local DB by given user
     * @param iliasObject
     * @param user
     */
    onDelete(iliasObject: ILIASObject, user: User): Promise<any>
}
