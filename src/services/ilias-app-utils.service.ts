export class ILIASAppUtils {

    public static formatSize(bytes:number, decimals:number = 2):string {
        if(!bytes) return '0 KB';
        let k = 1000; // or 1024 for binary
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    }

}