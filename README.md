# Project Management Dashboard

A project and task management platform built with **Optimizely CMS**, **ASP.NET Core**, **React**, and a separate **.NET REST API**. The application allows authenticated users to manage projects, tasks, and project memberships while enforcing multiple layers of security and access control.

## Features

### Project Management

* Create, edit, and delete projects
* Manage project members
* Project-specific authorization
* Dashboard for project overview

### Task Management

* Create, update, and remove tasks
* Assign tasks to project members
* Real-time updates with SignalR
* Project-scoped task visibility

### Optimizely CMS Integration

* Content management through Optimizely CMS
* Role-based access control for CMS editors and administrators
* React frontend integrated into Optimizely Razor views

## Security Features

### Authentication & Authorization

* ASP.NET Core Identity authentication
* Role-Based Access Control (RBAC)
* Protected administrative resources using `[Authorize]`
* Secure logout with server-side session invalidation

### API Security

* API Key authentication
* Constant-time key comparison using `CryptographicOperations.FixedTimeEquals`
* Server-side proxy to prevent client-side API key exposure
* User-context forwarding between web application and API
* Project membership verification
* HTTP 401 and 403 enforcement

### Additional Security Controls

* Input validation using FluentValidation
* IP-based rate limiting
* Audit logging of security-sensitive operations
* CORS restrictions
* Content Security Policy (CSP) with nonce support
* HTTPS communication

## Architecture

Browser
↓
Optimizely CMS (.NET 8 + React)
↓
Server-side Proxy
↓
Backend REST API (.NET)
↓
SQL Server

The architecture separates presentation, authentication, authorization, business logic, and persistence into distinct layers.

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Razor Views

### Backend

* ASP.NET Core
* REST API
* FluentValidation
* SignalR

### CMS

* Optimizely CMS

### Database

* SQL Server
* Entity Framework Core

### Security

* ASP.NET Core Identity
* API Key Authentication
* Rate Limiting
* Audit Logging
* CSP
* CORS

## What I Built

This project was developed as part of my Bachelor's Thesis in Computer Engineering at Chalmers University of Technology.

The work focused on designing and implementing:

* Secure communication between a web application and a backend API
* Role-based access control in Optimizely CMS
* Multi-layer authorization architecture
* Defense-in-depth security mechanisms
* Secure session handling and API protection

The project also includes a complete project and task management solution developed around these security requirements.
