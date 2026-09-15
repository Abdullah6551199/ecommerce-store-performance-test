# Nasrify E-Commerce Apps System

This directory houses pluggable apps / extensions for the Nasrify e-commerce platform.

## App Architecture
Each app contains:
- `manifest.json`: Metadata, permissions, and extension points
- `icon.svg`: App icon
- `admin/`: Components rendered inside the admin panel
- `storefront/`: Components rendered on public storefront pages
- `api/`: API route handlers
- `lib/`: App-specific helper functions and logic

## Hello World Demo App
The `hello-world/` app serves as the reference implementation for:
- Testing the manifest validation pipeline
- Lifecycle transitions (Install, Toggle, Uninstall)
- Dynamic component injection at extension points
- Safe permission gating
