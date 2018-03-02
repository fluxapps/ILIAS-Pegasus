const textBlockJsonSchema: object = {
  "description": "Contains all text blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "minimum": 1
      },
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_VISIT_PLACE$"
      },
      "content": {
        "description": "The text blocks content as html format",
        "type": "string"
      }
    },
    "required": ["id", "sequence", "visibility", "content"]
  }
};

const pictureBlockJsonSchema: object = {
  "description": "Contains all picture blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "minimum": 1
      },
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_VISIT_PLACE$"
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
      },
      "hash": {
        "description": "sha256 hash of the image returned by the url property of this object",
        "type": "string"
      }
    },
    "required": ["id", "sequence", "visibility", "title", "description", "thumbnail", "url", "hash"]
  }
};

const videoBlockJsonSchema: object = {
  "description": "Contains all video blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "minimum": 1
      },
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_VISIT_PLACE$"
      },
      "url": {
        "description": "Relative path of the file",
        "type": "string",
        "pattern": "^(.*?\/){2,}.*?\.mp4$"
      },
      "hash": {
        "description": "sha256 hash of the image returned by the url property of this object",
        "type": "string"
      }
    },
    "required": ["id", "sequence", "visibility", "url", "hash"]
  }
};

const iliasLinkJsonSchema: object = {
  "description": "Contains all ILIAS link blocks of the learnplace",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "minimum": 1
      },
      "sequence": {
        "description": "Position of the block ordering",
        "type": "integer",
        "minimum": 1
      },
      "visibility": {
        "type": "string",
        "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_VISIT_PLACE$"
      },
      "refId": {
        "description": "The ref id used in ILIAS",
        "type": "integer",
        "minimum": 1
      }
    },
    "required": ["id", "sequence", "visibility", "refId"]
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
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "minimum": 1
        },
        "title": { "type": "string" },
        "expanded": {
          "description": "if the accordion should be expanded by default or not",
          "type": "boolean"
        },
        "text": textBlockJsonSchema,
        "picture": pictureBlockJsonSchema,
        "video": videoBlockJsonSchema,
        "iliasLink": iliasLinkJsonSchema,
      },
      "required": ["id", "title", "expanded", "text", "picture", "video", "iliasLink"]
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
          "pattern": "^ALWAYS$|^NEVER$|^ONLY_AT_PLACE$|^AFTER_VISIT_PLACE$"
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
