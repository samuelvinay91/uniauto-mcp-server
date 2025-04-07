# UniAuto MCP Server Documentation

This directory contains the documentation for UniAuto MCP Server.

The documentation is built with Jekyll and deployed to GitHub Pages at: https://samuelvinay91.github.io/uniauto-mcp-server/

## Structure

- `index.md` - Main landing page
- `smithery-landing.md` - Smithery.ai integration landing page
- `api/` - API documentation
- `ai-integration/` - AI integration guides
- `setup/` - Setup guides
- `_config.yml` - Jekyll configuration

## Building Locally

To build and preview the documentation locally:

```bash
# Install Jekyll
gem install bundler jekyll

# Clone the repo
git clone https://github.com/samuelvinay91/uniauto-mcp-server.git
cd uniauto-mcp-server

# Install dependencies
cd docs
bundle install

# Serve locally
bundle exec jekyll serve
```

Then navigate to `http://localhost:4000` in your browser.

## Contributing

Contributions to the documentation are welcome. Please submit a pull request with your changes.