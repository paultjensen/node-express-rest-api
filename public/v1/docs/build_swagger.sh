#!/usr/bin/env bash

echo 'Building swagger.json file from multiple parts...';
multi-file-swagger swagger_multipart.yaml > swagger.json
