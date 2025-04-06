# Contributing to UniAuto MCP Server

Thank you for considering contributing to the UniAuto MCP Server! This document outlines the process for contributing to the project and how to report issues.

## Code of Conduct

Our project adheres to a Code of Conduct that we expect all contributors to follow. By participating, you are expected to uphold this code. Please report unacceptable behavior to uniauto@example.com.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as much detail as possible.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots or animated GIFs** which show you following the described steps and clearly demonstrate the problem.
* **If the problem is related to performance or memory**, include a CPU profile capture with your report.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
* **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as Markdown code blocks.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots or animated GIFs** which help you demonstrate the steps or point out the part of the project which the suggestion is related to.
* **Explain why this enhancement would be useful** to most users.
* **List some other applications where this enhancement exists.**
* **Specify which version you're using.**
* **Specify the name and version of the OS you're using.**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the JavaScript styleguide
* Include unit tests when adding new features
* End all files with a newline
* Avoid platform-dependent code

## Style Guides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider using conventional commits format:
  * feat: (new feature)
  * fix: (bug fix)
  * docs: (documentation)
  * style: (formatting, missing semi colons, etc; no code change)
  * refactor: (refactoring code)
  * test: (adding tests, refactoring tests; no production code change)
  * chore: (updating grunt tasks etc; no production code change)

### JavaScript Styleguide

* Use ESLint with the project's established rules
* Prefer ES6 classes over prototypes
* Use ES6 syntax when possible (arrow functions, template strings, etc.)
* Use semicolons
* 2 spaces for indentation
* Prefer `const` over `let` and `let` over `var`
* Line length limit: 100 characters
* Prefer single quotes over double quotes
* Inline exports with declarations
* Prefer arrow functions over function expressions
* Prefer template strings over string concatenation
* Prefer promises over callbacks
* Prefer async/await over raw promises when possible

### Documentation Styleguide

* Use [Markdown](https://daringfireball.net/projects/markdown) for documentation.
* Reference methods and classes in markdown with the custom `{@link}` syntax:
  * Class: `{@link ClassName}`
  * Method: `{@link ClassName#methodName}`
* Document all public methods and classes

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

* `bug` - Issues that represent a bug in the project
* `enhancement` - Issues that represent a new feature or improvement
* `documentation` - Issues related to documentation
* `duplicate` - Issues that are duplicates of other issues
* `good first issue` - Issues that are suitable for first-time contributors
* `help wanted` - Issues that need assistance from the community
* `question` - Issues that are questions or need more information
* `invalid` - Issues that are not valid or don't make sense
* `wontfix` - Issues that will not be addressed
