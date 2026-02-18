# Kanboard CLI

Professional CLI for interacting with Kanboard via JSON-RPC.

## Installation

```bash
cd kanboard-cli
npm install
npm link
```

Now you can use the `kanboard` command anywhere.

## Configuration

Create a `.env` file in the root directory (using `.env.example` as a template):

```env
KB_URL=https://your-kanboard.com/jsonrpc.php
KB_USER=jsonrpc
KB_TOKEN=your_token_here
```

## Usage

### Projects

#### List all projects
```bash
kanboard project list
```

### Tasks

#### List tasks in a project
```bash
kanboard task list <project_id>
```

#### Show task details
```bash
kanboard task show <task_id>
```

#### Create a new task
```bash
kanboard task create -p <project_id> -t "Task Title" [--color red] [--priority 2]
```

#### Move a task to another column
```bash
kanboard task move <task_id> <column_id>
```

#### Assign a task to a user
```bash
kanboard task assign <task_id> <user_id>
```

#### Close a task
```bash
kanboard task close <task_id>
```

#### Remove a task
```bash
kanboard task remove <task_id>
```

### Comments

#### Add a comment
```bash
kanboard task comment add <task_id> "Your comment text"
```

#### List comments
```bash
kanboard task comment list <task_id>
```

## Tech Stack

- **Commander.js**: CLI framework.
- **Axios**: API communication.
- **Chalk**: Terminal colors.
- **CLI Table 3**: ASCII table rendering.
- **Dotenv**: Environment variable management.
