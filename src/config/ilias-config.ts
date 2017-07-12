import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Log} from "../services/log.service";

@Injectable()
export class ILIASConfig {

  protected data: any = {};

  /**
   * ILIASConfig
   *
   * reads to configuration from config.json
   *
   * @param http
   */
  constructor(private http: Http) {
    // Log.write(this, "ILIASConfig constructor");
    this.loadData().subscribe(
      data => this.data = data
    );
  }


  loadData() {
    return this.http.get("assets/config.json").map(data => {
      return data.json();
    });
  }

  /**
   * Get a config value, returns a Promise resolving the value
   * @param key
   */
  get(key: string): Promise<any> {
    Log.write(this, "Asking for Config: " + this.data);
    if (Object.keys(this.data).length) {
      return Promise.resolve(this.getByKey(key));
    } else {
      return Promise.reject("No such config.");
    }
  }

  /**
   * @param key
   * @returns any
   */
  protected getByKey(key: string) {
    if (!this.data.hasOwnProperty(key)) {
      return null;
    }

    return this.data[key];
  }

}
