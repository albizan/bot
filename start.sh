#!/bin/bash

sleep 5
echo "Starting migrations... "
npm run migrations
echo "Starting Bot... "
npm run start