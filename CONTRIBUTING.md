# Contributing to CC_GodMode 🤝

First of all: **Thank you!** Being here means you either:
- a) Found a bug
- b) Have a brilliant idea
- c) Got lost

For all three cases: Welcome!

---

## 🐛 Reporting Bugs

1. **Check first** if the bug hasn't already been reported (search Issues)
2. **Open an Issue** with:
   - What you expected
   - What happened instead
   - Your environment (OS, Claude Code version, Node version)
   - Steps to reproduce
3. **Bonus points** for screenshots or logs

### Template:

```markdown
**What should happen:**
The @validator should find all consumers.

**What happens instead:**
It finds only half of them and then takes a lunch break.

**Environment:**
- macOS 14.x
- Claude Code 1.x.x
- Node 20.x

**Steps to reproduce:**
1. ...
2. ...
3. Despair
```

---

## 💡 Feature Requests

Do you have an idea how CC_GodMode can become even better?

1. **Open an Issue** with the label `enhancement`
2. Describe:
   - The problem you want to solve
   - Your proposed solution
   - Alternatives you've considered

No idea is too wild. Except maybe "Claude should also make me coffee". That doesn't work (yet).

---

## 🔧 Contributing Code

### Setup

```bash
# Fork the repo on GitHub
# Then:
git clone https://github.com/YOUR-USERNAME/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
```

### Create a branch

```bash
git checkout -b feature/my-brilliant-idea
# or
git checkout -b fix/that-annoying-bug
```

### Make changes

- Stick to the existing code style
- Test your changes
- Write meaningful commit messages

### Commit Message Format

```
type(scope): short description

Longer description if necessary.

Types: feat, fix, docs, style, refactor, test, chore
```

**Examples:**
```
feat(agents): add @reviewer agent for code reviews
fix(hooks): handle files with spaces in path
docs(readme): add troubleshooting section
```

### Create a Pull Request

1. Push your branch: `git push origin feature/my-brilliant-idea`
2. Open a Pull Request on GitHub
3. Describe your changes
4. Wait for review (I try to be quick, promise)

---

## 📁 Project Structure

```
CC_GodMode/
├── agents/           # The subagents
├── scripts/          # Automation scripts
├── templates/        # Project templates
├── config/           # Configuration files
├── Agents/           # Generated reports (ignored in .gitignore)
└── docs/             # Additional documentation
```

### Where does what go?

| Change | File/Folder |
|--------|-------------|
| New agent | `agents/name.md` |
| New script | `scripts/name.js` |
| New template | `templates/name.template` |
| Documentation | `README.md` or `docs/` |

---

## 🎨 Code Style

### Markdown (Agents, Docs)

- Use `##` for main sections
- Code blocks with language annotation (```bash, ```typescript)
- Tables for structured data
- Emojis are allowed (but don't overdo it)

### JavaScript (Scripts)

- Use ES6+ features
- Comments for complex logic
- Don't forget error handling
- No external dependencies (only Node built-ins)

---

## 🧪 Testing

Before creating a PR:

1. **Test the installation** (YOLO and Safe Mode)
2. **Test the agents** in a real project
3. **Test the hooks** with different file paths

### Quick Test Checklist

- [ ] Installation runs through
- [ ] Agents are recognized
- [ ] Hooks trigger for API files
- [ ] Reports land in `Agents/`
- [ ] Nothing explodes

---

## 🙋 Questions?

- Open an Issue with the label `question`
- Or write to me directly (see README for contact)

---

## 📜 Code of Conduct

Be nice. That's basically it.

More specifically:
- Respect other contributors
- Constructive criticism is welcome, jerk behavior is not
- We're all here to learn

---

<div align="center">

**Thanks for contributing!** 🎉

*"Alone you can write code. Together you can also understand it."*

</div>
