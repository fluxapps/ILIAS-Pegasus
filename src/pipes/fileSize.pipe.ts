import { Pipe, PipeTransform } from '@angular/core';
import {ILIASAppUtils} from "../services/ilias-app-utils.service";


@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {
    transform(value: number): any {
        return ILIASAppUtils.formatSize(value);
    }
}