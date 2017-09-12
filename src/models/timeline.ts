/**
 * Contains the data to display a timeline.
 */
export class TimeLine {

  readonly icon: string = "pulse";
  readonly text: string;

  /**
   * Sets the text as language variable depending on the given {@code type}.
   * If the type can not be identified a default text will be set.
   *
   *
   * @param {string} type an ILIAS object type
   */
  constructor(
    type: string = ""
  ) {

    switch (type) {
      case "crs":
        this.text = "timeline.course";
        break;
      case "grp":
        this.text = "timeline.group";
        break;
      default:
        this.text = "timeline.default";
        break;
    }
  }
}
