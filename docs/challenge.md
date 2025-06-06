# Task Manager App | Frontend, React project

https://devchallenges.io/challenge/task-manager-app

![alt text](cover.jpeg 'Title')

As a frontend developer, it requires you to work with external libraries/tools all the time, sometimes it can be complicated and takes days to understand. In this challenge, you will work with a task manager application, this will challenge you to work with external JS library, as well as data management.

## Learning Goals

By completing this challenge, you will:

- Build a task management app.
- Work with an external JS library.
- Manage data in the app.
- Implement various functionalities like adding tasks, editing task details, adding/removing tags, creating/deleting boards, drag and drop, and toggling between light and dark mode.
- Deploy the solution and submit Repository URL and Demo URL.

## Requirements

You should create a web page that includes the following elements:

- Build a task management app that matches the given design.
- By default, users can see a board with 4 columns (Backlog, In Progress, In Review, and Completed) and a default task in backlog.
- Users can add a new task to Backlog.
- When a task is selected, users can edit the task name and status.
- When a task is selected, users can choose to add a random cover image with a given API or remove the image if it exists.
- When a task is selected, users can add and remove tags. They should be able to choose at least 4 tags like in the design.
- Users can add a new board. When a board is created, it should have a random logo and 'Default board' as the name.
- Users can delete the board.
- Users can drag and drop task cards to different columns.
- Users can see the number of tasks in each column.
- Users can toggle between light and dark mode.
- Deploy the solution and submit Repository URL and Demo URL.

## Technical Details

To build the task management app, you can use an external JS library of your choice. This will help you handle data management and implement various functionalities.

- You can fetch the list of default board lists with the following API endpoint:  
  [https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/list.json](https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/list.json)
- To fetch board data, you can use the following API endpoint for example:  
  [https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/board-1.json](https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group_1/data/task-manager/board-1.json)

You should find the endpoints from the board list.

## Instructions for Using a Frontend Library for Task Manager Challenge

### 1\. Set Up Your Project:

- Use Create React App to set up a new React project.
- Install necessary dependencies such as axios for API calls and react-beautiful-dnd for drag-and-drop functionality.

### 2\. Fetch Initial Data:

- Fetch the list of default board lists using the provided API endpoint.
- Fetch board details using the endpoints given in the board list.

### 3\. Create Components:

- Create React components for the task manager, including board, columns and task cards.
- Implement drag-and-drop functionality using react-beautiful-dnd.

### 4\. Implement Features:

- Allow users to drag and drop task cards between columns.
- Display the number of tasks in each column.
- Implement a toggle for light and dark mode.

### 5\. Deploy the Application:

- Deploy your application using a service like Vercel or Netlify.
- Submit the repository URL and demo URL.

#### Example using React:

import React, { useState, useEffect } from "react";

import axios from "axios";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import "./App.css";

const fetchBoardList \= async () \=> {

const response \= await axios.get(

    "https://raw.githubusercontent.com/devchallenges-io/curriculum/refs/heads/main/4-frontend-libaries/challenges/group\_1/data/task-manager/list.json"

);

return response.data;

};

function App() {

const \[boards, setBoards\] \= useState(\[\]);

const onDragEnd \= (result) \=> {

};

return (

    <div className\="App"\>

      <h1\>Task Manager</h1\>

      <DragDropContext onDragEnd\={onDragEnd}\>

        {boards.map((board, index) \=> (

          <Board key\={index} board\={board} /\>

        ))}

      </DragDropContext\>

    </div\>

);

}

export default App;

import React from "react";

import { Droppable, Draggable } from "react-beautiful-dnd";

const Board \= ({ board }) \=> {

const \[tasks, setTasks\] \= useState({});

const fetchBoardDetails \= async (url) \=> {

};

return (

    <Droppable droppableId\={board.id}\>

      {}

    </Droppable\>

);

};

export default Board;

## Tech Stack

For this project, you have the flexibility to use HTML, CSS, and JavaScript or a Front-end library like React, Vue, etc. Consider the learning curve and additional setup required when choosing a library.

Good luck with the challenge!

Build a task management app that matches the given design.

By default, users can see a board with 4 columns (Backlog, In Progress, In Review, and Completed) and a default task in backlog.

Users can add a new task to Backlog.

When a task is selected, users can edit the task name and status.

When a task is selected, users can choose to add a random cover image with a given API or remove the image if exists.

When a task is selected, users can add and remove tags. They should be able to choose at least 4 tags like in the design.

Users can add a new board. When a board is created, it should have a random logo and 'Default board' as the name.

Users can delete the board.

Users can drag and drop task cards to different columns.

Users can see the number of tasks in each column.

Users can toggle between light and dark mode.

Deploy the solution and submit Repository URL and Demo URL.
