# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.0]
### Added
- Icons for all known ILIAS objects
- Overlay icon for ILIAS objects which are not supported by the app.

## [4.0.4] 
### Added
- Support for ILIAS Universität zu Köln
- Mergerd PR #1, thanks to @mhilbert! 
- Mergerd PR #2, thanks to @fneumann!  

## [4.0.3] 
### Added
- Support for ILIAS Dresden

## [4.0.2] 2020-05-26
### Added
- Support for ILIAS BIWE
- Support for ILIAS BBS III

### Fixed 🦀
- Linked Objects (globe not adjusted)
- Favorite star not adjusted
- News: Message if no news
- Privacy Ppolicy link not readable.

### Removed 👎
- Temporarily removed Darkmode from vanilla brand (-> conflict with dynamic theming)

## [4.0.1] 2020-05-13

### Changed 🚀
- Removed old WebView using WK WebView only (see config.xml)
- Update InAppBrowser and it's dependecies.

### Fixed 🦀
- Some minor Visuale issues in obeject list

## [4.0.0] - 2019-11-05
### Added 👍
- MapBox support for "Learnplaces"
- Angular routing
- A changlog file
- Dynamic theming with the PegasusHelper plugin

### Changed 🚀
- Angular Version
- Onboarding Layout
- ObjectList Layout
- Bump up to Ionic 4

### Fixed 🦀
-Crash on Learnplace Open.

### Removed 👎
- GoogleMaps Support
