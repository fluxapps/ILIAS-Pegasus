import {Injectable, InjectionToken} from "@angular/core";
import {File} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {UserStorageService} from "../../services/filesystem/user-storage.service";

/**
 * Builds directory paths for learning module.
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearningModulePathBuilder {
    /**
     * the name of the directory where all learning modules are located (with ending /)
     */
    lmsBaseDirName: string;

    /**
     * constructs the name of the root directory for a given learning module (with ending /)
     */
    lmDirName(objId: number): string;

    /**
     * constructs the absolute path for a location relative to the root directory (with ending /)
     */
    inLocalLmDir(location: string, createRecursive: boolean): Promise<string>;

    /**
     * constructs the absolute path to the directory containing the contents of the learning module (with ending /)
     */
    getLmDirByObjId(objId: number): Promise<string>;
}

export const LEARNING_MODULE_PATH_BUILDER: InjectionToken<LearningModulePathBuilder> = new InjectionToken("token for learning module path builder");

@Injectable()
export class LearningModulePathBuilderImpl implements LearningModulePathBuilder {
    lmsBaseDirName: string = "learning_modules/";

    constructor(
        private readonly file: File,
        private readonly platform: Platform,
        private readonly userStorage: UserStorageService,
    ) {}

    lmDirName(objId: number): string {
        return `lm_${objId}/`;
    }

    async inLocalLmDir(path: string, createRecursive: boolean): Promise<string> {
        path = this.withoutEndingSlash(path);
        return this.userStorage.dirForUser(`${this.lmsBaseDirName}${path}`, createRecursive);
    }

    async getLmDirByObjId(objId: number): Promise<string> {
        return this.inLocalLmDir(this.lmDirName(objId), false);
    }

    /**
     * returns the path provided in the argument, but without an ending /
     */
    private withoutEndingSlash(path: string): string {
        return path[path.length-1] === "/" ? path.slice(0, -1) : path;
    }
}
