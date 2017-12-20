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
  readonly url: string
}

export interface VideoBlock extends Block {
  readonly url: string
}

export interface ILIASLinkBlock extends Block {
  readonly refId: number
}

export interface AccorionBlock extends Block {
  readonly text: TextBlock
  readonly picture: PictureBlock
  readonly video: VideoBlock
  readonly iliasLink: ILIASLinkBlock
}

export interface BlockObject {
  readonly text: TextBlock
  readonly picture: PictureBlock
  readonly video: VideoBlock
  readonly iliasLink: ILIASLinkBlock
  readonly accordion: AccorionBlock
}
