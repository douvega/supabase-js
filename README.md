# Supabase-JS: Agnostic Node.js Backend for Supabase

## Overview

Supabase-JS is a vanilla Node.js backend that provides an agnostic layer of abstraction on top of Supabase. It transforms Supabase into a flexible low-code service by providing generic endpoints and powerful filtering capabilities. Built without frameworks, this lightweight service allows for easy integration with any Supabase project.

## Features

- **Pure Node.js**: No frameworks, just vanilla JavaScript
- **Generic Data Access**: Interact with any Supabase table through a unified API
- **Advanced Filtering**: Powerful filtering system supporting complex queries with nested conditions
- **Custom Views**: Define and reuse complex database views with joins
- **Authentication**: Built-in authentication handling for Supabase Auth
- **Extensible Architecture**: Modular design for easy extension

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
/src
  /core              # Core functionality
    supabase-client.js   # Supabase connection
    data-repository.js   # Generic data operations
    view-engine.js       # Handles custom views
  /auth              # Authentication
    auth-service.js      # Authentication logic
    auth-middleware.js   # Auth protection
  /server            # Server components
    http-server.js       # Node.js HTTP server
    router.js            # Request routing
    request-parser.js    # Request body parsing
  /controllers       # Request handlers
    data-controller.js   # Generic data endpoints
    view-controller.js   # View endpoints
    auth-controller.js   # Auth endpoints
  /utils             # Utilities
    error-handler.js     # Error management
    logger.js            # Logging
    filter-parser.js     # Complex query parsing
```

## API Endpoints

### Data Operations

- `GET /api/data/:tableName` - Get all records (with filtering)
- `GET /api/data/:tableName/:id` - Get a specific record
- `POST /api/data/:tableName` - Create a new record
- `PUT /api/data/:tableName/:id` - Update a record
- `DELETE /api/data/:tableName/:id` - Delete a record

### Views

- `GET /api/view/:viewId` - Get data using a predefined view

### Authentication

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/logout` - Logout current user

## Filtering System

The most powerful feature of Supabase-JS is its advanced filtering system that allows for complex queries without writing custom endpoints.

### Basic Filtering

Simple filters can be applied as query parameters:

```
GET /api/data/users?is_active=true&role=admin
```

### Advanced Filtering

Complex filters can be created using a JSON structure:

```
GET /api/data/users?filter={"logic":"AND","filters":[{"field":"status","operator":"=","value":"active"},{"logic":"OR","filters":[{"field":"role","operator":"=","value":"admin"},{"field":"role","operator":"=","value":"moderator"}]}]}
```

This translates to: `status = 'active' AND (role = 'admin' OR role = 'moderator')`

### Supported Operators

- `=` - Equal
- `<>`, `!=` - Not equal
- `>` - Greater than
- `>=` - Greater than or equal
- `<` - Less than
- `<=` - Less than or equal
- `LIKE` - Pattern matching with wildcards
- `ILIKE` - Case-insensitive pattern matching
- `IN` - Value in a list
- `IS NULL` - Is null
- `IS NOT NULL` - Is not null

### Filter Structure

```javascript
{
  // Top level can be either a condition or a logic group
  
  // For a condition:
  field: "fieldName",
  operator: "=",
  value: "someValue"
  
  // For a logic group:
  logic: "AND", // or "OR"
  filters: [
    // Array of conditions or nested logic groups
    { field: "status", operator: "=", value: "active" },
    { 
      logic: "OR",
      filters: [
        { field: "role", operator: "=", value: "admin" },
        { field: "role", operator: "=", value: "moderator" }
      ]
    }
  ]
}
```

## Custom Views

Views allow you to define reusable query structures, including joins between tables, that can be easily referenced.

### View Definition Structure

```javascript
{
  "id": "active_users",
  "name": "Active Users with Tasks",
  "description": "Lists all active users with their assigned tasks",
  "is_public": true,
  "join_definition": [
    {
      "from": {"table": "users", "field": "id"},
      "joinType": "left",
      "to": {"table": "tasks", "field": "assigned_to"}
    }
  ],
  "allowed_filters": ["users.role", "tasks.status", "tasks.due_date"]
}
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/supabase-js.git
   cd supabase-js
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=https://yourproject.supabase.co
   SUPABASE_KEY=your-supabase-key
   PORT=3000
   ```

4. Start the server:
   ```
   npm start
   ```

## Usage Example

### Simple Data Fetching

```javascript
// Client-side code
async function getActiveTasks() {
  const response = await fetch('/api/data/tasks?status=active');
  const data = await response.json();
  return data;
}
```

### Complex Filtering

```javascript
// Client-side code
async function getHighPriorityOverdueTasks() {
  const filter = {
    logic: 'AND',
    filters: [
      { field: 'priority', operator: '=', value: 'high' },
      { field: 'due_date', operator: '<', value: new Date().toISOString() },
      { field: 'is_completed', operator: '=', value: false }
    ]
  };
  
  const url = `/api/data/tasks?filter=${encodeURIComponent(JSON.stringify(filter))}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

## Future Enhancements

- Visual query builder interface for creating complex filters
- Support for Supabase Storage
- Supabase Edge Functions integration
- Caching layer for improved performance
- Field-level permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
