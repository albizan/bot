#!/bin/bash

sleep 5
echo "Starting migrations... "
npm run migrate:latest
echo "Starting Bot... "
npm run start