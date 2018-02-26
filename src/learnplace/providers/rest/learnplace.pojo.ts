export interface Map {
  readonly visibility: string
}

export interface Location {
  readonly latitude: number
  readonly longitude: number
  readonly elevation: number
  readonly radius: number
}

export interface JournalEntry {
  readonly username: string
  readonly timestamp: number
}

export interface LearnPlace {
  readonly objectId: number
  readonly location: Location
  readonly map: Map
}

export interface Block {
  readonly id: number
  readonly sequence: number
  readonly visibility: string
}

export interface TextBlock extends Block {
  readonly content: string
}

export interface PictureBlock extends Block {
  readonly title: string
  readonly description: string
  readonly thumbnail: string
  readonly thumbnailHash: string,
  readonly url: string,
  readonly hash: string
}

export interface VideoBlock extends Block {
  readonly url: string,
  readonly hash: string
}

export interface ILIASLinkBlock extends Block {
  readonly refId: number
}

export interface AccordionBlock extends Block {
  readonly text: Array<TextBlock>
  readonly picture: Array<PictureBlock>
  readonly video: Array<VideoBlock>
  readonly iliasLink: Array<ILIASLinkBlock>
}

export interface BlockObject {
  readonly text: Array<TextBlock>
  readonly picture: Array<PictureBlock>
  readonly video: Array<VideoBlock>
  readonly iliasLink: Array<ILIASLinkBlock>
  readonly accordion: Array<AccordionBlock>
}
