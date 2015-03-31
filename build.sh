#! /bin/bash

echo "Vendor dir creation"
mkdir dist/vendor

echo "Moving dependencies into vendor dir"
cp bower_components/* dist/vendor/*
cp node_modules/jsclass dist/vendor/jsclass