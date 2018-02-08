/**
 * The time-line link builder, creates a link to an arbitrary ILIAS time-line enabled container object, for example a course.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface TimelineLinkBuilder {
  target(refId: number): TimelineLinkBuilder;
}

export class TimelineLinkBuilderImpl {

  constructor() {}
}
