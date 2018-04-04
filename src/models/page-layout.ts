/**
 * Holds the the styling information, if an ILIAS object has a page layout.
 */
export class PageLayout {

  readonly icon: string = "./assets/icon/icon_info_blue.svg";
  readonly text: string;

  constructor(
    type: string = ""
  ) {

    switch (type) {
      case "crs":
        this.text = "page-layout.course";
        break;
      case "grp":
        this.text = "page-layout.group";
        break;
      case "fold":
        this.text = "page-layout.folder";
        break;
      default:
        this.text = "page-layout.default";
        break;
    }
  }
}
