#! /bin/bash

echo "Vendor dir creation"
mkdir vendor

echo "Moving dependencies into vendor dir"
cp bower_components/* vendor/*
cp node_modules/jsclass vendor/jsclass