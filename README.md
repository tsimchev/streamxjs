# StreamxJS

## About this project

StreamXJS is a general purpose front-end representing a connected graph and managing its presentation based on browser events.

## Terminology

* Element := represents a graph vertex
* Connection := represents a graph edge
* Stream := represents a graph
* Plot := represents an area where graph get drawn

## Features

* Plot can be initialized in any HTML block element.
* Plot can be scrolled by drag/move/drop any point of it (there is no scrolling limit).
* Stream can be loaded in Plot area.
* Stream elements can be added to a stream and connected with each other.
* Stream elements can be moved across plot area (dragged and dropped). Elements are restricted not to leave visible area boundaries.
* Stream connections can be reattached to different elements.
* Keep history of select elements.

## Demo

Demo application contains simple bootstrap web page demonstrating currently implemented features.
Supports desktop and mobile browsers.

### Run demo application
* Checkout repository
* Load demo/index.html in your browser

![alt tag](https://raw.githubusercontent.com/tsimchev/streamxjs/master/demo/demo-screenshot.png =250x "StreamXJS demo application")

