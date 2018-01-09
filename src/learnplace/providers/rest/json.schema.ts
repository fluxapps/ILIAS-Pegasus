const textBlockJsonSchema: object = {
  "description": "Contains all text blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_PLACE_VISIT$"
      },
      "content": {
        "description": "The text blocks content as html format",
        "type": "string"
      }
    },
    "required": ["sequence", "visibility", "content"]
  }
};

const pictureBlockJsonSchema: object = {
  "description": "Contains all picture blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_PLACE_VISIT$"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "thumbnail": {
        "description": "Base64 encoded image. Thumbnail has a static width of 1280px",
        "type": "string"
      },
      "url": {
        "description": "Relative path of the file",
        "type": "string",
        "pattern": "^(.*?\/){2,}.*?\.(jpg|png)$"
      }
    },
    "required": ["sequence", "visibility", "title", "description", "thumbnail", "url"]
  }
};

const videoBlockJsonSchema: object = {
  "description": "Contains all video blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_PLACE_VISIT$"
      },
      "url": {
        "description": "Relative path of the file",
        "type": "string",
        "pattern": "^(.*?\/){2,}.*?\.mp4$"
      }
    },
    "required": ["sequence", "visibility", "url"]
  }
};

const iliasLinkJsonSchema: object = {
  "description": "Contains all ILIAS link blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_PLACE_VISIT$"
      },
      "refId": {
        "description": "The ref id used in ILIAS",
        "type": "integer",
        "minimum": 1
      }
    },
    "required": ["sequence", "visibility", "refId"]
  }
};

export const blocksJsonSchema: object = {
  "title": "blocks",
  "type": "object",
  "properties": {
    "text": textBlockJsonSchema,
    "picture": pictureBlockJsonSchema,
    "video": videoBlockJsonSchema,
    "iliasLink": iliasLinkJsonSchema,
    "accordion": {
      "description": "Contains the id of all accordions of this leanrplace",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "text": textBlockJsonSchema,
          "picture": pictureBlockJsonSchema,
          "video": videoBlockJsonSchema,
          "iliasLink": iliasLinkJsonSchema
        },
        "required": ["text", "picture", "video", "iliasLink"]
      }
    }
  },
  "required": ["text", "picture", "video", "iliasLink", "accordion"]
};

export const learnplaceJsonSchema: object = {
  "title": "Learnplace",
  "type": "object",
  "properties": {
    "objectId": {
      "description": "The object id used in ILIAS to identify the object",
      "type": "integer",
      "minimum": 1
    },
    "location": {
      "type": "object",
      "properties": {
        "latitude": {
          "type": "float"
        },
        "longitude": {
          "type": "float"
        },
        "elevation": {
          "description": "The height of a geographic location",
          "type": "float"
        },
        "radius": {
          "type": "integer"
        }
      },
      "required": ["latitude", "longitude", "elevation", "radius"]
    },
    "map": {
      "type": [ "object", "null" ],
      "properties": {
        "visibility": {
          "type": "string",
          "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_PLACE_VISIT$"
        }
      },
      "required": ["visibility"]
    }
  },
  "required": ["objectId", "location", "map"]
};

export const journalEntriesJsonSchema: object = {
  "title": "visit journal",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "username": {
        "type": "string"
      },
      "timestamp": {
        "description": "The unix time in seconds",
        "type": "long",
        "minimum": 0
      }
    },
    "required": ["username", "timestamp"]
  }
};
