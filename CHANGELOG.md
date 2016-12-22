# Change Log


## Unreleased


### Added

-   SC-46: `bm server serverless --deployment-bucket` flag to specify a custom AWS S3 bucket for deployment


### Fixed

-   SC-45: root route "/" has content instead of authorisation error


## 1.0.0-beta.1 - 2016-12-19


### Changed

-   Example project names to be more realistic

-   **BREAKING CHANGE**: `--stage` flag to `--env`, functionality has not changed.

-   **BREAKING CHANGE**: `<project_path>` input option to a `--cwd` flag for all CLI commands

-   **BREAKING CHANGE**: `bm server scope --project <project>` now sets project using `bm server scope <project>`
