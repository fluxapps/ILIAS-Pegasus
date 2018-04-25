---
title: Network
menuHeading: Components
authors:
    - nschaefli
    - nmaerchy
sections:
    - name: Http Client
      children:
        - Usage http client
        - Get request
        - Post request
        - Request options
        - Response
    - name: Link Builder
      children:
        - Injection
        - Personal News Link
        - Resource Links
        - ILIAS Object Links
        - Course Timeline Links
        - Loading Page Link (Deprecated)
        - Login Page Link
    - name: ILIAS rest
      children:
        - Configuration
        - Usage ILIAS rest
    - name: File transfer
      children:
        - File download
        - File upload
---

# Http Client

ILIAS Pegasus provides a http client based on the Angular http client.

**Features**
* Promise based functions
* Request retry
* JSON validation with JSON schema
* Response handling

## Usage http client

Inject the `HttpClient` in your service.

```typescript

@Injectable()
export class MyClass {
    
    constructor(
        private readonly httpClient: HttpClient
    ) {}
}
```

## Get request

For a `GET` request use the `get` method.
```typescript
const response: HttpResponse = await this.httpClient.get("https://ilias.de");
```

## Post request

For a POST request use the post method.
```typescript
const body: string = JSON.stringify(myBody);
const response: HttpResponse = await this.httpClient.post("https://ilias.de", body);
```

> Assuming `myBody` is a JSON object containing the data you wanna post.

## Request options

You can pass optional request options to both, `GET` and `POST` requests:
* headers
* url parameters

```typescript
const response: HttpResponse = await this.httpClient.get("https://ilias.de", <RequestOptions>{
        headers: [["Accept", "application/json"]],
        urlParams: [["some_id", "5"], ["filter", "course"]]
    });
```

Both `headers` and `urlParams` are optional.

## Response

A request returns the `HttpResponse` object. `HttpResponse` allows you to read the
data from the response body or handle the response directly.

### Response types

You can get several types from the response:
* JSON
* text
* ArrayBuffer

```typescript

const response: HttpResponse = await this.httpClient.get("http://ilias.de/rest-example");

const exampleJSON: ExampleResponse = response.json<ExampleResponse>(jsonSchema);
const exampleText: string = response.text();
const exampleArrayBuffer: ArrayBuffer = response.arrayBuffer();
```

#### JSON

To get the response as JSON you have to provide a JSON schema to match the response.
The generic type of the `json` method must be an interface matching the given JSON schema.

```typescript

const jsonSchema: object = {
    "title": "example response",
    "type": "object",
    "properties": {
        "id": { "type": "integer", "minimum": 1 },
        "name": { "type": "string" },
        "value": { "type": "boolean" }
    },
    "required": ["id", "name", "value"]
}
 
 
interface ExampleResponse {
    readonly id: number;
    readonly name: string;
    readonly value: boolean
}

const exampleJSON: ExampleResponse = response.json<ExampleResponse>(jsonSchema);
```

Learn more about [JSON schema](http://json-schema.org/)

### Response handling

To handle the request you can use the `HttpResponse.handle` method.

```typescript
const response: HttpResponse = await this.httpClient.get("http://ilias.de/rest-example");
 
const responseAsText: string = response.handle<string>(async(it): Promise<string> => {
    return it.text();
});
```

The given function will be invoked and its return value will be returned on the `handle` method.
If the response was not successful, an appropriate error will be thrown.



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

import {LINK_BUILDER, LinkBuilder} from "src/services/link/link-builder.service";

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

# ILIAS rest

ILIAS Pegasus provides an interface for [ILIAS rest](https://github.com/hrz-unimr/Ilias.RESTPlugin) which 
manages conditions of the rest api.

**Features**
* Manages the access token
* Manages the authentication
* Recognizes the ILIAS installation of the current user

## Configuration
You have to provide OAuth 2 data to ILIAS rest.

**Step 1** - Implement the `OAuth2DataSupplier` interface

```typescript
@Injecable()
export class MyOAuth2DataSupplier implements OAuth2DataSupplier {
 
 
    async getCredentials(): Promise<ClientCredentials> {
         
        // Provide your data for the client credentials
        return <ClientCredentials>{
            clientId: "your client id",
            clientSecret: "your client secret",
            apiURL: "your url to the api",
            accessTokenURL: "your url to get a new access token",
            token: <Token>{
                type: "Bearer",
                accessToken: "your access token",
                refreshToken: "your refresh token",
                lastAccessTokenUpdate: 1513088463,
                accessTokenTTL: 3600
            }
        }
    }
}
```

**Step 2** - Add your implementation to Angular providers
```typescript
{
      provide: OAUTH2_DATA_SUPPLIER,
      useClass: MyOAuth2DataSupplier
    }
```

> Provide it with the `OAUTH2_DATA_SUPPLIER` inject token

**Step 3** - Provide a `TokenResponseConsumer`

The `TokenResponseConsumer` will be invoked, when a new access token is requested.
You can write your own consumer to be notified, when a new token is requested.

```typescript

@Injectable()
export class MyTokenResponseConsumer implements TokenResponseConsumer {
     
    accept(token: OAut2Token): Promise<void> {
        
        // Store the new tokens, do your stuff with the tokens
    }
}
```

And then provide your implementation in Angular.

If you don't need to be notified when a new access token is requested, you can provide
the `DefaultTokenResponseConsumer`, which is an empty implementation of the `TokenResponseConsumer`.

```typescript
{
      provide: TOKEN_RESPONSE_CONSUMER,
      useClass: DefaultTokenResponseConsumer
}
```

## Usage ILIAS rest
To access an ILIAS rest endpoint, use `ILIASRest`.

```typescript

@Injectable()
export class MyILIASApi {
 
 
    constructor(
        @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest
    ) {}
 
 
    async getFileData(): Promise<Array<FileData>> {
         
        const response: HttpResponse = await this.iliasRest.get("/v1/file-data", <ILIASRequestOptions>{accept: "application/json"});
 
        return response.handle<FileData>(async(it): Promise<FileData> =>
            it.json<FileData>(fileDataJsonSchema);
        );     
    }
}

export interface FileData {
    ...
}
 
 
const fileDataJsonSchema: object = {
    ...
};
```

You don't have to bother about a valid access token or the appropriate ILIAS installation.
This is all managed by `ILIASRest`.

# File transfer

Technically, you can download files with the [Http Client](#http-client), but for
performance issues, ILIAS Pegasus provides a native file transfer.

## File download

To download a file you can use the `FileDownloader`.

```typescript
export class MyService {
    
    constructor(
        @Inject(FILE_DOWNLOADER) private readonly fileDownloader: FileDownloader
    ) {}
    
    async downloadMyFile(): Promise<void> {
        
        await this.fileDownloader.download({
            url: "http://example.com/myfile.txt",
            filePath: "where/to/store/the/file.txt"
        })
    }
}
```

## File upload

To upload a file you can use the `FileUploader`.

```typescript
export class MyService {
    
    constructor(
        @Inject(FILE_UPLOADER) private readonly fileUploader: FileUploader
    ) {}
    
    async downloadMyFile(): Promise<void> {
        
        await this.fileDownloader.upload({
            url: "http://example.com/fileupload",
            filePath: "path/to/the/file.txt"
        })
    }
}
```
