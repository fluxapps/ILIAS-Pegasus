---
title: Network
menuHeading: Components
authors:
    - nschaefli
sections:
    - name: Link Builder
      children:
        - Injection
        - Personal News Link
        - Resource Links
        - ILIAS Object Links
        - Course Timeline Links
        - Loading Page Link (Deprecated)
        - Login Page Link
---
# Link Builder
The link builder enables the user to generate links which are interpreted by the pegasus helper plugin.

#### Supported Links
- Link to a timeline of a course
- Link to content of a course
- Personal news link
- Link to login page
- Link to web access checker protected resources, like pictures and videos
- Link to pegasus loading page (deprecated)

## Injection

**Token Name:** `LINK_BUILDER`

**Interface:** `LinkBuilder`


```typescript

import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";

class YourClass {
    constructor(
        @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
        ){}
}
```

## Usage

### Personal News Link

The personal news link points to the personal desktop news view with the given context and news.
The context describes the "parent" of the news entry for example a course. In contrast the news id
points to a specific event like a file upload which occured in that specified context for example the previous
mentioned course. 

```typescript

const id: number = 41;
const context: number = 28;

this.linkBuilder.news()
                .newsId(id)
                .context(context)
                .build();

```

### Resource Links
The resource links are pointing to web access checker protected resources, for example pictures or
videos.

```typescript

const resourcePath: string = "/data/path-to-resource/exampe.jpg";

this.linkBuilder.resource()
                .resource(resourcePath)
                .build();

```

### ILIAS Object Links
This links point to an arbitrary ILIAS object which can be referred by a ref id.

```typescript

const refId: number = 56;

this.linkBuilder.default()
                .target(refId)
                .build();
```

### Course Timeline Links

The link points to the timeline of an ILIAS course. Objects in ILIAS are referred with so called
ref ids which are pointing to an object id. Therefore, its possible to refer to the same course with
different ids. 

```typescript

const refId: number = 56;

this.linkBuilder.timeline()
                .target(refId)
                .build();
```
### Loading Page Link (Deprecated)
The loading page was used in previous versions of the app to indicate loading sequences.
However this screen is no longer used because the required requests are done before the navigation
confirmation is shown.
The loading screen is deprecated and scheduled for removal and should no longer be used.

```typescript
this.linkBuilder.loadingPage()
                .build();
```

### Login Page Link
The login page link points to the ILIAS login page, which is used to authenticated the user.
Both the client id as well as the installation url are configured in the "assets/config.json" configuration.


```typescript
const clientId: string = "default";
const url: string = "https://ilias.example.org";

this.linkBuilder.loginPage()
                .clientId(clientId)
                .installation(url)
                .build();
```  


