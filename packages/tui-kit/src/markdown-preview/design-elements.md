# Ratkit Markdown Preview Design Elements

Source: `/Users/alpha/workspace/alpha-innovation-labs/ratkit/src/widgets/markdown_preview/widgets/markdown_widget/foundation/elements/`

This document captures Ratkit markdown-preview visual design rules only. It is not implementation code.

## Overall design language

- Uses Nerd Font glyphs for semantic markers: headings, bullets, checkboxes, links, images, and code languages.
- Headings are rendered as full-width highlighted bars with level-specific foreground/background colors.
- Inline emphasis keeps text flow intact and applies terminal modifiers: bold, italic, underlined, crossed-out.
- Structural blocks use box-drawing characters and colored markers instead of raw markdown syntax.
- Theme colors are supported for paragraph/link/emphasis/list/blockquote/hr/code colors, with hardcoded fallbacks.

## Heading levels

Source files:

- `foundation/elements/heading.rs`
- `foundation/elements/constants.rs`

### Rendering rules

- H1-H6 render as a single full-width bar.
- Each heading gets:
  - optional collapse indicator: `▼` expanded, `▶` collapsed
  - indentation equal to heading level: H1 = 1 space, H2 = 2 spaces, etc.
  - level-specific icon
  - bold heading text
  - right padding filled with the heading background to the available width
- Heading colors are level-based and are not overridden by the app theme.
- Optional heading border is a full-width `▀` line using the heading background as foreground.

### Heading icons

| Level | Icon |
| --- | --- |
| H1 | `󰲡 ` |
| H2 | `󰲣 ` |
| H3 | `󰲥 ` |
| H4 | `󰲧 ` |
| H5 | `󰲩 ` |
| H6 | `󰲫 ` |

### Heading colors

| Level | Background | Foreground |
| --- | --- | --- |
| H1 | `rgb(80, 40, 80)` | `rgb(255, 180, 255)` |
| H2 | `rgb(40, 60, 80)` | `rgb(130, 180, 255)` |
| H3 | `rgb(40, 80, 60)` | `rgb(130, 255, 180)` |
| H4 | `rgb(80, 60, 40)` | `rgb(255, 200, 130)` |
| H5 | `rgb(60, 60, 60)` | `rgb(200, 200, 200)` |
| H6 | `rgb(50, 50, 50)` | `rgb(170, 170, 170)` |

## Paragraph and inline text

Source files:

- `foundation/elements/paragraph.rs`
- `foundation/elements/text.rs`
- `services/theme/markdown_colors.rs`

### Text segment rules

| Markdown element | Visual treatment |
| --- | --- |
| Plain text | default style / theme text color where applied |
| Bold | bold modifier; theme strong color or reset fallback |
| Italic | italic modifier; theme emphasis color or reset fallback |
| Bold italic | bold + italic; theme strong color or reset fallback |
| Inline code | padded as ` code `, dark background, code foreground |
| Regular link | green/theme link text color; optional leading link icon |
| Autolink | `rgb(100, 150, 255)`, italic, underlined |
| Strikethrough | `rgb(150, 150, 150)`, crossed-out |
| HTML | green italic in segment renderer; plain/default in paragraph renderer |

### Inline code colors

- Background: `rgb(17, 19, 23)`
- Foreground fallback: `rgb(240, 113, 120)`
- Theme foreground: `theme.markdown.code`

## Links and images

Source file: `foundation/elements/constants.rs`

- Default link icon: `󰌹 `
- Image icon: `󰥶 `
- Email icon: `󰀓 `
- Domain-specific icons are selected for GitHub, GitLab, Discord, LinkedIn, Reddit, Slack, StackOverflow, Wikipedia, YouTube, and image file extensions.
- Regular links use green fallback `rgb(100, 200, 100)`.
- Autolinks use blue italic underline.

## Lists and task lists

Source files:

- `foundation/elements/list_item.rs`
- `foundation/elements/constants.rs`

### Rendering rules

- Nested list indentation is two spaces per depth.
- Unordered bullet marker cycles by depth.
- Ordered list marker is `{number}. `.
- Marker color uses `theme.markdown.list_item` or yellow fallback.
- Wrapped continuation lines align under item content after the marker/checkbox prefix.

### Bullet markers

| Depth cycle | Marker |
| --- | --- |
| 0 | `● ` |
| 1 | `○ ` |
| 2 | `◆ ` |
| 3 | `◇ ` |

### Checkbox markers

| State | Icon | Color |
| --- | --- | --- |
| Unchecked | `󰄱 ` | `rgb(180, 180, 180)` |
| Checked | `󰱒 ` | `rgb(100, 200, 100)` |
| Todo | `󰥔 ` | `rgb(255, 200, 100)` |

## Blockquotes

Source file: `foundation/elements/blockquote.rs`

- Marker: `▋`
- Marker color: `rgb(100, 149, 237)` cornflower blue.
- Each nesting level adds `▋ `.
- Quote text is italic.
- Quote text color uses `theme.markdown.block_quote` or fallback `rgb(180, 180, 200)`.
- Wrapped quote lines repeat the full nesting marker prefix.

## Horizontal rules

Source file: `foundation/elements/horizontal_rule.rs`

- Rendered as a full-width `─` line.
- Color uses `theme.markdown.horizontal_rule` or fallback `rgb(100, 100, 100)`.

## Code blocks

Source files:

- `foundation/elements/code_block.rs`
- `foundation/elements/constants.rs`

### Layout

- Code blocks use rounded/box borders:
  - header starts with `╭─ ` and ends with `╮`
  - content lines use `│` borders
  - bottom border uses `╰──╯`
- Header includes a language icon and language name. Empty language displays `text`.
- Code content supports optional syntax-highlighted spans.
- Content lines include line numbers formatted minimally like ` 1 `.
- Code blocks nested inside blockquotes prepend the blockquote marker prefix before each border/content line.

### Default code block theme: Ayu Dark

| Token | Color |
| --- | --- |
| Border | `rgb(57, 63, 84)` |
| Background | `rgb(10, 14, 20)` |
| Header background | `rgb(15, 20, 28)` |
| Header text | `rgb(179, 186, 197)` |
| Icon | `rgb(255, 180, 84)` |
| Line number | `rgb(70, 80, 100)` |
| Line separator | `rgb(45, 52, 70)` |

### Supported code block theme palettes

- Ayu Dark
- GitHub Dark
- Dracula
- Nord
- Monokai
- One Dark
- Gruvbox
- Tokyo Night
- Catppuccin

## Tables

Source file: `foundation/elements/table.rs`

- Borders use box-drawing characters.
- Border color: dark gray.
- Header cells: cyan + bold.
- Body cells: white.
- Cells are padded with one leading and one trailing space.

### Border characters

- Top: `┌`, `─`, `┬`, `┐`
- Header separator: `├`, `─`, `┼`, `┤`
- Bottom: `└`, `─`, `┴`, `┘`
- Row separators: `│`

## Frontmatter

Source file: `foundation/elements/frontmatter.rs`

- Frontmatter is collapsible.
- Expanded top line: `▼ ` followed by full-width `─` border.
- Collapsed line: `▶ ─── {context_id} ───...`
- Bottom line: full-width `─` border.
- Collapse icon color: yellow.
- Border color: dark gray.
- Keys: coral/red `rgb(240, 113, 120)`.
- Values: green `rgb(170, 217, 76)`.
- Wrapped values align under the value column after `key: `.

## Default markdown color palette

Source file: `services/theme/markdown_colors.rs`

| Role | Color |
| --- | --- |
| Text | `rgb(191, 189, 182)` |
| Heading | `rgb(255, 180, 255)` |
| Link | `rgb(100, 200, 100)` |
| Link text | `rgb(100, 200, 100)` |
| Inline code | `rgb(230, 180, 100)` |
| Block quote | `rgb(180, 180, 200)` |
| Emphasis | `rgb(100, 150, 255)` |
| Strong | `rgb(255, 180, 84)` |
| Horizontal rule | `rgb(100, 100, 100)` |
| List item | `rgb(100, 200, 100)` |
| List enumeration | `rgb(100, 200, 100)` |
| Image | `rgb(100, 200, 100)` |
| Image text | `rgb(100, 200, 100)` |
| Code block | `rgb(191, 189, 182)` |

## Replication notes for tui-kit

- Keep the preview as composable pieces: heading, inline segment, paragraph, list item, blockquote, code block, table, frontmatter, and horizontal rule.
- Preserve Ratkit's visual hierarchy: full-width colored heading bars, glyph-based markers, and box-drawing structural blocks.
- Provide fallbacks for terminals without full theme input.
- Treat Nerd Font glyphs as design defaults, while allowing consumers to override icons later if needed.
- Keep implementation files small and single-purpose when code is added later.
