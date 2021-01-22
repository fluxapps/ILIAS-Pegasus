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
      "type": "array",
      "items": {
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
        "zoomLevel": { "type": "integer" },
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
      "userId": {
        "type": "integer",
        "minimum": 1
      },
      "timestamp": {
        "description": "The unix time in seconds",
        "type": "long",
        "minimum": 0
      }
    },
    "required": ["userId", "timestamp"]
  }
};

export const iliasObjectJsonSchema: object = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "title": "The root schema",
    "description": "The root schema comprises the entire JSON document.",
    "default": {},
    "examples": [
        {
            "objId": "1917",
            "title": "test obj",
            "description": "",
            "hasPageLayout": false,
            "hasTimeline": false,
            "permissionType": "read",
            "refId": "919",
            "parentRefId": "176",
            "type": "htlm",
            "link": "https://test.studer-raimann.ch/pegasus-ilias54-php7/goto.php?target=htlm_919&client_id=default",
            "repoPath": [
                "ILIAS",
                "Demo srag",
                "test obj"
            ]
        }
    ],
    "required": [
        "objId",
        "title",
        "description",
        "hasPageLayout",
        "hasTimeline",
        "permissionType",
        "refId",
        "parentRefId",
        "type",
        "link",
        "repoPath"
    ],
    "properties": {
        "objId": {
            "$id": "#/properties/objId",
            "type": "string",
            "title": "The objId schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "1917"
            ]
        },
        "title": {
            "$id": "#/properties/title",
            "type": "string",
            "title": "The title schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "obj example"
            ]
        },
        "description": {
            "$id": "#/properties/description",
            "type": "string",
            "title": "The description schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                ""
            ]
        },
        "hasPageLayout": {
            "$id": "#/properties/hasPageLayout",
            "type": "boolean",
            "title": "The hasPageLayout schema",
            "description": "An explanation about the purpose of this instance.",
            "default": false,
            "examples": [
                false
            ]
        },
        "hasTimeline": {
            "$id": "#/properties/hasTimeline",
            "type": "boolean",
            "title": "The hasTimeline schema",
            "description": "An explanation about the purpose of this instance.",
            "default": false,
            "examples": [
                false
            ]
        },
        "permissionType": {
            "$id": "#/properties/permissionType",
            "type": "string",
            "title": "The permissionType schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "read"
            ]
        },
        "refId": {
            "$id": "#/properties/refId",
            "type": "string",
            "title": "The refId schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "919"
            ]
        },
        "parentRefId": {
            "$id": "#/properties/parentRefId",
            "type": "string",
            "title": "The parentRefId schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "176"
            ]
        },
        "type": {
            "$id": "#/properties/type",
            "type": "string",
            "title": "The type schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "htlm"
            ]
        },
        "link": {
            "$id": "#/properties/link",
            "type": "string",
            "title": "The link schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "https://test.studer-raimann.ch/pegasus-ilias54-php7/goto.php?target=htlm_919&client_id=default"
            ]
        },
        "repoPath": {
            "$id": "#/properties/repoPath",
            "type": "array",
            "title": "The repoPath schema",
            "description": "An explanation about the purpose of this instance.",
            "default": [],
            "examples": [
                [
                    "ILIAS",
                    "Demo srag"
                ]
            ],
            "additionalItems": true,
            "items": {
                "$id": "#/properties/repoPath/items",
                "anyOf": [
                    {
                        "$id": "#/properties/repoPath/items/anyOf/0",
                        "type": "string",
                        "title": "The first anyOf schema",
                        "description": "An explanation about the purpose of this instance.",
                        "default": "",
                        "examples": [
                            "ILIAS",
                            "Demo srag"
                        ]
                    }
                ]
            }
        }
    },
    "additionalProperties": true
}
