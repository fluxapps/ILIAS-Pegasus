import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {User} from "../models/user";
import {Injectable} from "@angular/core";

@Injectable()
export class TokenLinkRewriter {

  public constructor(
    private readonly restProvider: ILIASRestProvider
  ) {}

  public rewrite(link: string): Promise<string> {

    let userId = 0;

    return User.currentUser()
      .then(user => {
        userId = user.iliasUserId;
        return this.restProvider.getAuthToken(user);
      })
      .then(tokenObject => {

        const pattern: RegExp = new RegExp("(http(?:s?):\\/\\/.*)\\/.*_(\\d+)");
        const matches: string[] = pattern.exec(link);

        // TODO: Check for matches
        const host: string = matches[1];
        const refId: string = matches[2];

        const url: string = `${host}/goto.php?target=ilias_app_auth|${userId}|${refId}|${tokenObject.token}`;

        return Promise.resolve(url);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }
}
