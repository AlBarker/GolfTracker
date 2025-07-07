# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run web version

## Architecture Overview

This is a React Native golf tracking app built with Expo, using:

- **Navigation**: React Navigation v7 with native stack navigator
- **UI**: Custom UI components with Tailwind CSS (NativeWind)
- **Database**: Expo SQLite for local data persistence
- **Styling**: Tailwind CSS with custom color scheme and design system

### Core Data Models

The app revolves around three main entities:

1. **Course**: Golf course with holes (par, handicap index)
2. **Round**: Golf round played on a course with detailed hole scores
3. **HoleScore**: Individual hole performance data (strokes, putts, fairway hits, GIR, etc.)

### Database Layer

- `src/utils/database.ts`: SQLite database service with CRUD operations
- `src/utils/storage.ts`: Storage service wrapper around database
- `src/utils/stats.ts`: Statistics calculations and round analytics

### Screen Structure

- **HomeScreen**: Course list and navigation hub
- **AddCourseScreen**: Course creation form
- **CourseDetailsScreen**: Course info and round history
- **RoundEntryScreen**: Score entry for completed rounds
- **LiveScoringScreen**: Real-time scoring during play
- **RoundDetailsScreen**: Detailed round statistics

### UI Components

Located in `src/components/ui/`:
- Tailwind-styled components (Button, Card, Input, Select, Switch)
- Custom color scheme with golf-themed green palette
- Consistent design system with rounded corners and shadows

### Type Definitions

All TypeScript interfaces are centralized in `src/types/index.ts`, including navigation types for React Navigation.