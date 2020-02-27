#!/bin/bash

sleep 5 #Give enough time to postgres to boot up
echo "Starting migrations... "
npm run migrations
echo "Starting Bot... "
npm run start