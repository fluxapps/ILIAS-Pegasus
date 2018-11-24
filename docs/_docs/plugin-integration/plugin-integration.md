---
title: ILIAS Plugin Integration
menuHeading: ILIAS Plugin Integration
authors:
    - nschaefli
sections:
    - Introduction
    - Project Structure
    - name: Known Issues
      children:
      - Database migration
---
# ILIAS Plugin Integration

## Introduction
The ILIAS Pegasus app is capable of displaying certain ILIAS object as well as 
custom plugin types for example Learnplace objects.

The code which is handling the custom types is located
 in its own folder structure to keep the old ILIAS related parts separated.
This should ease the task of modularisation in a later development stage.

The whole modularisation is still work in progress. Therefore, the plugin integration
will be updated as the modularisation is progressing.

## Project Structure
The app code is structured in two different types test code and the code which will be executed in
production.

The production code is also structured in different groups and layers.
Actions are designed to execute a certain action which is triggered by a user interaction.
The app folder contains the basic app code like the root module and service definitions. 
Migrations are containing the database migrations which are executed while the app is starting.
The providers folder contains data provider which abstract the data access and the service folder
contains services which are responsible for the business logic it self. All services are consumed 
by pages which are stored in the pages folder.

Custom types like Learnplaces are stored in a separated folder which contain the same 
structure as the app it self. For example the Learnplace folder contains services and providers as well.

Example Structure:
```text
|
- src
|   |
|   - learnplace
|   |   |
|   |   - pages
|   |   |
|   |   - providers
|   |   |
|   |   - services

``` 

All custom types should be separated in a separate structure in order to 
ease the migration process to a modularized system in the future.
The structure also helps to separate the concerns of custom and core types.

## Known Issues
### Database migrations
The database migration in its current form can't be separated in the custom type folder
and must be created as described in the [database component documentation]({{site.baseurl}}{% link _docs/components/database.md %}).
