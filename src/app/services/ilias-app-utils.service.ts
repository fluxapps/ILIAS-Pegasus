export class ILIASAppUtils {

    static formatSize(bytes: number, decimals: number = 2): string {
        if(!bytes) return "0 KB";
        const k = 1000; // or 1024 for binary
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
    }

}